const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://backend-mauve-tau.vercel.app'

// API utility function
const api = {
  fetch: async (endpoint: string, options: RequestInit = {}) => {
    // Get token from localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const defaultOptions: RequestInit = {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...defaultOptions,
        ...options,
        headers: {
          ...defaultOptions.headers,
          ...(options.headers || {})
        }
      });

      if (response.status === 401) {
        // Handle unauthorized - clear local storage and redirect to login
        localStorage.removeItem('token');
        window.location.href = '/login';
        return null;
      }

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'API request failed');
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }
};

// Auth API
export async function login(email: string, password: string) {
  const response = await api.fetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });

  if (response?.token) {
    localStorage.setItem('token', response.token);
  }
  return response?.user;
}

export async function register(userData: { email: string; password: string; name: string }) {
  const response = await api.fetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });

  if (response?.token) {
    localStorage.setItem('token', response.token);
  }
  return response?.user;
}

export async function logout() {
  await api.fetch('/auth/logout', {
    method: 'POST'
  });
  localStorage.removeItem('token');
  return true;
}

export async function getCurrentUser() {
  try {
    const user = await api.fetch('/auth/me');
    return user;
  } catch {
    return null;
  }
}

// Listings API
export async function getListings(params?: { 
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}) {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value.toString());
    });
  }

  return api.fetch(`/listings?${searchParams.toString()}`);
}

export async function getListing(id: string) {
  return api.fetch(`/listings/${id}`);
}

export interface CreateListingData {
  title: string;
  description: string;
  location: string;
  price_per_night: number;
  image_url: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
}

export async function createListing(data: CreateListingData): Promise<Listing> {
  return api.fetch('/listings', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function deleteListing(id: number): Promise<void> {
  await api.fetch(`/listings/${id}`, {
    method: 'DELETE'
  });
}

// Bookings API
export async function createBooking(data: {
  listing_id: number;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
}) {
  return api.fetch('/bookings', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function getUserBookings() {
  const bookings = await api.fetch('/bookings?include=listing');
  
  // If the data is wrapped in a property, extract the bookings array
  return Array.isArray(bookings) ? bookings : (bookings?.bookings || []);
}

export async function getHostListings() {
  return api.fetch('/listings/host/listings');
}

// Types based on backend schema
export interface User {
  id: number;
  email: string;
  name: string;
}

export interface Listing {
  id: number;
  host_id: number;
  host_name: string;
  title: string;
  description: string;
  location: string;
  price_per_night: number;
  image_url: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: number;
  listing_id: number;
  user_id: number;
  check_in_date: string;
  check_out_date: string;
  total_price: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  created_at: string;
  updated_at: string;
  listing?: Listing;
} 
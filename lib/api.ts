const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

// Listings API
export async function getListings(params?: { 
  location?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}) {
  const searchParams = new URLSearchParams()
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value) searchParams.append(key, value.toString())
    })
  }

  const response = await fetch(
    `${API_BASE_URL}/listings?${searchParams.toString()}`,
    { credentials: 'include' }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch listings')
  }

  return response.json()
}

export async function getListing(id: string) {
  const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch listing')
  }

  return response.json()
}

export interface CreateListingData {
  title: string
  description: string
  location: string
  price_per_night: number
  image_url: string
  max_guests: number
  bedrooms: number
  bathrooms: number
}

export async function createListing(data: CreateListingData): Promise<Listing> {
  const response = await fetch(`${API_BASE_URL}/listings`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to create listing")
  }

  return response.json()
}

export async function deleteListing(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/listings/${id}`, {
    method: "DELETE",
    credentials: "include",
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.message || "Failed to delete listing")
  }
}

// Bookings API
export async function createBooking(data: {
  listing_id: number
  check_in_date: string
  check_out_date: string
  total_price: number
}) {
  try {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
      credentials: 'include',
    })

    if (!response.ok) {
      // Try to parse error message from JSON response first
      try {
        const errorData = await response.json()
        throw new Error(errorData.message || errorData.error || 'Failed to create booking')
      } catch (e) {
        // If parsing JSON fails, throw generic error with status
        throw new Error(`Failed to create booking (Status: ${response.status})`)
      }
    }

    return response.json()
  } catch (error) {
    console.error('Booking creation error:', error)
    throw error instanceof Error ? error : new Error('Failed to create booking')
  }
}

export async function getUserBookings() {
  const response = await fetch(`${API_BASE_URL}/bookings?include=listing`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch bookings')
  }

  const data = await response.json()
  // If the data is wrapped in a property, extract the bookings array and ensure listing data is present
  const bookings = Array.isArray(data) ? data : (data.bookings || [])
  
  // For each booking that has a listing_id but no listing data, fetch the listing details
  const bookingsWithListings = await Promise.all(
    bookings.map(async (booking: Booking) => {
      if (booking.listing_id && !booking.listing) {
        try {
          const listing = await getListing(booking.listing_id.toString())
          return { ...booking, listing }
        } catch (error) {
          console.error(`Failed to fetch listing ${booking.listing_id}:`, error)
          return booking
        }
      }
      return booking
    })
  )

  return bookingsWithListings
}

export async function getHostListings() {
  const response = await fetch(`${API_BASE_URL}/listings/host/listings`, {
    credentials: 'include',
  })

  if (!response.ok) {
    throw new Error('Failed to fetch host listings')
  }

  return response.json()
}

// Types based on backend schema
export interface User {
  id: number
  email: string
  name: string
}

export interface Listing {
  id: number
  host_id: number
  host_name: string
  title: string
  description: string
  location: string
  price_per_night: number
  image_url: string
  max_guests: number
  bedrooms: number
  bathrooms: number
  created_at: string
  updated_at: string
}

export interface Booking {
  id: number
  listing_id: number
  user_id: number
  check_in_date: string
  check_out_date: string
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
  updated_at: string
  listing?: Listing
} 
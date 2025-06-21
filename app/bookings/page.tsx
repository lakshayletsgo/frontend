"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { getUserBookings } from "@/lib/api"
import type { Booking } from "@/lib/api"

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        setError(null)
        const response = await getUserBookings()
        console.log('Raw API Response:', response) // Debug log

        // Ensure we have an array of bookings
        const bookingsArray = Array.isArray(response) ? response : []
        console.log('Processed bookings array:', bookingsArray) // Debug log
        
        setBookings(bookingsArray)
      } catch (error) {
        console.error("Failed to fetch bookings:", error)
        setError(error instanceof Error ? error.message : 'Failed to fetch bookings')
        setBookings([]) // Reset to empty array on error
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [])

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (e) {
      console.error('Error formatting date:', e)
      return 'Invalid date'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">Loading your bookings...</div>
        </main>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <Alert>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
          <div className="mt-4">
            <Button asChild>
              <Link href="/listings">Browse Stays</Link>
            </Button>
          </div>
        </main>
      </div>
    )
  }

  // Ensure bookings is always an array
  const safeBookings = Array.isArray(bookings) ? bookings : []

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>
        {safeBookings.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle>No Bookings Yet</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">You haven't made any bookings yet.</p>
              <Button asChild>
                <Link href="/listings">Browse Stays</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6">
            {safeBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <div className="md:flex">
                  {booking.listing && (
                    <div className="relative w-full md:w-48 h-48 md:h-auto">
                      <Image
                        src={booking.listing.image_url || "/placeholder.svg"}
                        alt={booking.listing.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2">
                          {booking.listing?.title || 'Untitled Property'}
                        </h3>
                        <p className="text-gray-600">
                          {booking.listing?.location || 'Location not available'}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {(booking.status || 'pending').charAt(0).toUpperCase() + (booking.status || 'pending').slice(1)}
                      </span>
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Check-in: {formatDate(booking.check_in_date)}</p>
                      <p>Check-out: {formatDate(booking.check_out_date)}</p>
                      <p className="font-semibold">Total: ${booking.total_price || 0}</p>
                    </div>
                    <div className="mt-4">
                      <Button asChild variant="outline">
                        <Link href={`/listings/${booking.listing_id}`}>
                          View Property
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
} 
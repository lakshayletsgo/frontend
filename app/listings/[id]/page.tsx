"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MapPin, Users, Bed, Bath, CalendarIcon, Link } from "lucide-react"
import { format, differenceInDays, isBefore } from "date-fns"
import { getListing, createBooking } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth"
import type { Listing } from "@/lib/api"

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [listing, setListing] = useState<Listing | null>(null)
  const [loading, setLoading] = useState(true)
  const [checkIn, setCheckIn] = useState<Date>()
  const [checkOut, setCheckOut] = useState<Date>()
  const [guests, setGuests] = useState(1)
  const [booking, setBooking] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const data = await getListing(params.id as string)
        setListing(data)
      } catch (error) {
        console.error("Failed to fetch listing:", error)
        setError("Failed to load listing details")
      } finally {
        setLoading(false)
      }
    }

    fetchListing()
  }, [params.id])

  const validateBooking = () => {
    if (!checkIn || !checkOut) {
      setError("Please select check-in and check-out dates")
      return false
    }

    if (isBefore(checkOut, checkIn)) {
      setError("Check-out date must be after check-in date")
      return false
    }

    if (guests < 1) {
      setError("Number of guests must be at least 1")
      return false
    }

    if (listing && guests > listing.max_guests) {
      setError(`Maximum number of guests allowed is ${listing.max_guests}`)
      return false
    }

    return true
  }

  const handleBooking = async () => {
    setError("")
    setSuccess(false)

    // Check if user is logged in
    try {
      const user = await getCurrentUser()
      if (!user) {
        router.push("/login")
        return
      }
    } catch (error) {
      console.log("Error getting current user:", error)
      router.push("/login")
      return
    }

    if (!validateBooking() || !listing || !checkIn || !checkOut) return

    setBooking(true)
    try {
      const nights = differenceInDays(checkOut, checkIn)
      if (nights < 1) {
        setError("Minimum stay is 1 night")
        return
      }

      const totalPrice = calculateTotal()
      if (totalPrice <= 0) {
        setError("Invalid total price")
        return
      }

      const bookingData = {
        listing_id: listing.id,
        check_in_date: format(checkIn, 'yyyy-MM-dd'),
        check_out_date: format(checkOut, 'yyyy-MM-dd'),
        total_price: totalPrice
      }

      console.log('Creating booking with data:', bookingData)
      const response = await createBooking(bookingData)
      console.log('Booking response:', response)

      setSuccess(true)
      // Reset form
      setCheckIn(undefined)
      setCheckOut(undefined)
      setGuests(1)
      // Redirect to bookings page after a short delay
      setTimeout(() => {
        router.push("/bookings")
      }, 2000)
    } catch (error) {
      console.error('Booking error:', error)
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("Failed to create booking. Please try again.")
      }
    } finally {
      setBooking(false)
    }
  }

  const calculateTotal = () => {
    if (!checkIn || !checkOut || !listing) return 0
    const nights = differenceInDays(checkOut, checkIn)
    return nights * listing.price_per_night
  }

  const isBookingDisabled = () => {
    if (booking) return true
    if (!checkIn || !checkOut) return true
    if (guests < 1 || (listing && guests > listing.max_guests)) return true
    if (checkIn && checkOut && differenceInDays(checkOut, checkIn) < 1) return true
    return false
  }

  const getBookingButtonText = () => {
    if (booking) return "Booking..."
    if (!checkIn || !checkOut) return "Select dates to book"
    if (guests < 1) return "Select number of guests"
    if (listing && guests > listing.max_guests) return `Maximum ${listing.max_guests} guests allowed`
    if (checkIn && checkOut && differenceInDays(checkOut, checkIn) < 1) return "Invalid dates"
    return "Book Now"
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-96 bg-gray-300 rounded-lg mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="h-8 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
              <div className="h-96 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Listing not found</h1>
            <Button asChild>
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="mb-4 bg-green-50 text-green-700 border-green-200">
            <AlertDescription>
              Booking successful! Redirecting to your bookings...
            </AlertDescription>
          </Alert>
        )}

        <div className="mb-8">
          <div className="relative h-96 rounded-lg overflow-hidden mb-6">
            <Image
              src={listing.image_url || "/placeholder.svg?height=400&width=800"}
              alt={listing.title}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
              <div className="flex items-center text-gray-600 mb-4">
                <MapPin className="w-5 h-5 mr-2" />
                <span>{listing.location}</span>
              </div>

              <div className="flex items-center gap-6 text-gray-600 mb-6">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  {listing.max_guests} guests
                </div>
                <div className="flex items-center">
                  <Bed className="w-5 h-5 mr-2" />
                  {listing.bedrooms} bedroom{listing.bedrooms !== 1 ? 's' : ''}
                </div>
                <div className="flex items-center">
                  <Bath className="w-5 h-5 mr-2" />
                  {listing.bathrooms} bathroom{listing.bathrooms !== 1 ? 's' : ''}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Description</h2>
              <p className="text-gray-700 leading-relaxed">{listing.description}</p>
            </div>

            <div className="mb-6">
              <h2 className="text-xl font-semibold mb-3">Host</h2>
              <p className="text-gray-700">Hosted by {listing.host_name}</p>
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>${listing.price_per_night}/night</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Check-in</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {checkIn ? format(checkIn, "MMM dd") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkIn}
                          onSelect={setCheckIn}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label>Check-out</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {checkOut ? format(checkOut, "MMM dd") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={checkOut}
                          onSelect={setCheckOut}
                          disabled={(date) => date < (checkIn || new Date())}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div>
                  <Label>Guests</Label>
                  <Input
                    type="number"
                    min={1}
                    max={listing.max_guests}
                    value={guests}
                    onChange={(e) => setGuests(parseInt(e.target.value))}
                  />
                </div>

                {checkIn && checkOut && (
                  <div className="border-t pt-4">
                    <div className="flex justify-between mb-2">
                      <span>
                        ${listing.price_per_night} × {differenceInDays(checkOut, checkIn)} nights
                      </span>
                      <span>${calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>${calculateTotal()}</span>
                    </div>
                  </div>
                )}

                <Button
                  className="w-full"
                  disabled={isBookingDisabled()}
                  onClick={handleBooking}
                >
                  {getBookingButtonText()}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { SearchForm } from "@/components/search-form"
import { PropertyCard } from "@/components/property-card"
import { getListings } from "@/lib/api"
import type { Listing } from "@/lib/api"
import { Suspense } from "react"

function HomeContent() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const searchParams = useSearchParams()
  const router = useRouter()

  const handleSearch = (params: {
    location?: string
    checkIn?: string
    checkOut?: string
    guests?: number
  }) => {
    const searchParams = new URLSearchParams()
    if (params.location) searchParams.set("location", params.location)
    if (params.checkIn) searchParams.set("checkIn", params.checkIn)
    if (params.checkOut) searchParams.set("checkOut", params.checkOut)
    if (params.guests) searchParams.set("guests", params.guests.toString())
    router.push(`/?${searchParams.toString()}`)
  }

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const params = {
          location: searchParams.get('location') || undefined,
          checkIn: searchParams.get('checkIn') || undefined,
          checkOut: searchParams.get('checkOut') || undefined,
          guests: searchParams.get('guests') ? parseInt(searchParams.get('guests')!) : undefined,
        }

        const data = await getListings(params)
        setListings(data)
      } catch (error) {
        console.error("Failed to fetch listings:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [searchParams])

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-center mb-2">Find Your Perfect Stay</h1>
          <p className="text-gray-600 text-center mb-8">Discover unique places to stay around the world</p>
          <SearchForm onSearch={handleSearch} />
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-300 h-48 rounded-t-lg"></div>
                <div className="bg-white p-4 rounded-b-lg">
                  <div className="h-4 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-4">
              <h2 className="text-2xl font-semibold">{listings.length} properties found</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {listings.map((listing) => (
                <PropertyCard
                  key={listing.id}
                  id={listing.id}
                  title={listing.title}
                  location={listing.location}
                  price={listing.price_per_night}
                  imageUrl={listing.image_url}
                  maxGuests={listing.max_guests}
                  bedrooms={listing.bedrooms}
                  bathrooms={listing.bathrooms}
                  hostName={listing.host_name}
                />
              ))}
            </div>

            {listings.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-xl font-semibold mb-2">No properties found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}

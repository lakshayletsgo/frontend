"use client"

import {  useState } from "react"
import { Header } from "@/components/header"
import { PropertyCard } from "@/components/property-card"
import { SearchForm } from "@/components/search-form"
import { getListings } from "@/lib/api"
import type { Listing } from "@/lib/api"
import { Suspense } from "react"

function ListingsContent() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  const handleSearch = async (searchParams: {
    location?: string
    checkIn?: string
    checkOut?: string
    guests?: number
  }) => {
    setLoading(true)
    try {
      const data = await getListings(searchParams)
      setListings(data)
    } catch (error) {
      console.error("Search failed:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Find Your Perfect Stay</h1>
          <SearchForm onSearch={handleSearch} />
        </div>

        {loading ? (
          <div className="text-center py-8">Loading available stays...</div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-600">No stays found matching your criteria.</p>
          </div>
        )}
      </main>
    </div>
  )
}

export default function ListingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gray-50 flex items-center justify-center">Loading...</div>}>
      <ListingsContent />
    </Suspense>
  )
} 
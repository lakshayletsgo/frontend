"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash2 } from "lucide-react"
import type { Listing } from "@/lib/api"
import { getHostListings, deleteListing } from "@/lib/api"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"

export default function HostDashboardPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [listingToDelete, setListingToDelete] = useState<Listing | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const data = await getHostListings()
        setListings(data)
      } catch (error) {
        console.error("Failed to fetch listings:", error)
        toast({
          title: "Error",
          description: "Failed to fetch your listings. Please try again.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchListings()
  }, [])

  const handleDelete = async () => {
    if (!listingToDelete) return

    setIsDeleting(true)
    try {
      await deleteListing(listingToDelete.id)
      setListings(listings.filter(listing => listing.id !== listingToDelete.id))
      toast({
        title: "Success",
        description: "Listing deleted successfully",
      })
    } catch (error) {
      console.error("Failed to delete listing:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete listing",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setListingToDelete(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Host Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your properties and bookings</p>
          </div>
          <Button asChild>
            <Link href="/host/listings/new" className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add New Listing
            </Link>
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading your listings...</div>
        ) : listings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <Card key={listing.id}>
                <div className="relative w-full h-48">
                  <Image
                    src={listing.image_url || "/placeholder.svg"}
                    alt={listing.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <CardHeader>
                  <CardTitle>{listing.title}</CardTitle>
                  <CardDescription>{listing.location}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-lg font-semibold">${listing.price_per_night}/night</div>
                    <div className="flex gap-2">
                      <Button variant="outline" asChild>
                        <Link href={`/listings/${listing.id}`}>View Details</Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="icon"
                        onClick={() => setListingToDelete(listing)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Listings Yet</CardTitle>
              <CardDescription>
                Start by adding your first property listing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/host/listings/new" className="flex items-center">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Listing
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}

        <AlertDialog open={!!listingToDelete} onOpenChange={() => setListingToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this listing?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your listing
                and cancel any future bookings.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={isDeleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {isDeleting ? "Deleting..." : "Delete Listing"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  )
}

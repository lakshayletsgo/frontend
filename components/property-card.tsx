import Image from "next/image"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Users, Bed, Bath, User } from "lucide-react"

interface PropertyCardProps {
  id: number
  title: string
  location: string
  price: number
  imageUrl: string
  maxGuests: number
  bedrooms: number
  bathrooms: number
  hostName: string
}

export function PropertyCard({
  id,
  title,
  location,
  price,
  imageUrl,
  maxGuests,
  bedrooms,
  bathrooms,
  hostName,
}: PropertyCardProps) {
  return (
    <Link href={`/listings/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative h-48">
          <Image 
            src={imageUrl || "/placeholder.svg?height=200&width=300"} 
            alt={title} 
            fill 
            className="object-cover" 
          />
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
            <span className="font-bold text-lg">${price}/night</span>
          </div>

          <div className="flex items-center text-gray-600 mb-2">
            <MapPin className="w-4 h-4 mr-1" />
            <span className="text-sm">{location}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {maxGuests} guests
            </div>
            <div className="flex items-center">
              <Bed className="w-4 h-4 mr-1" />
              {bedrooms} bed{bedrooms !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center">
              <Bath className="w-4 h-4 mr-1" />
              {bathrooms} bath{bathrooms !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-1" />
            <span>Hosted by {hostName}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

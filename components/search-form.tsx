"use client"

import type React from "react"
import { useState } from "react"
import {  useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Search, MapPin, Calendar as CalendarIcon, Users } from "lucide-react"
import { format } from "date-fns"

interface SearchFormProps {
  onSearch: (params: {
    location?: string
    checkIn?: string
    checkOut?: string
    guests?: number
  }) => void
}

export function SearchForm({ onSearch }: SearchFormProps) {
  const searchParams = useSearchParams()

  const [location, setLocation] = useState(searchParams.get("location") || "")
  const [checkIn, setCheckIn] = useState<Date | undefined>(
    searchParams.get("checkIn") ? new Date(searchParams.get("checkIn")!) : undefined
  )
  const [checkOut, setCheckOut] = useState<Date | undefined>(
    searchParams.get("checkOut") ? new Date(searchParams.get("checkOut")!) : undefined
  )
  const [guests, setGuests] = useState(searchParams.get("guests") || "")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const formatDate = (date: Date | undefined) => {
      if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
        return undefined;
      }
      return date.toISOString().split('T')[0];
    }

    onSearch({
      location: location || undefined,
      checkIn: formatDate(checkIn),
      checkOut: formatDate(checkOut),
      guests: guests ? parseInt(guests) : undefined
    })
  }

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardContent className="p-6">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location" className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                Location
              </Label>
              <Input
                id="location"
                placeholder="Where to?"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                Check-in
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    {checkIn ? format(checkIn, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkIn}
                    onSelect={setCheckIn}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center">
                <CalendarIcon className="w-4 h-4 mr-1" />
                Check-out
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    {checkOut ? format(checkOut, "MMM d, yyyy") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={checkOut}
                    onSelect={setCheckOut}
                    initialFocus
                    disabled={(date) => checkIn ? date < checkIn : false}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="guests" className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                Guests
              </Label>
              <Input
                id="guests"
                type="number"
                placeholder="1"
                min="1"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
              />
            </div>
          </div>

          <Button type="submit" className="w-full md:w-auto">
            <Search className="w-4 h-4 mr-2" />
            Search Properties
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}

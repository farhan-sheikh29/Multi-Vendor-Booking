"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Search, Star } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";

const searchResults = [
  {
    title: "Luxury Haircut & Style",
    vendor: "The Gentleman's Cut",
    location: "New York, NY",
    price: 75,
    rating: 4.9,
    image: "/images/haircut.jpg",
  },
  {
    title: "Deep Tissue Massage",
    vendor: "Serenity Spa",
    location: "Los Angeles, CA",
    price: 120,
    rating: 4.8,
    image: "/images/massage.jpg",
  },
  {
    title: "Gel Manicure",
    vendor: "Nail Artistry",
    location: "Chicago, IL",
    price: 45,
    rating: 4.9,
    image: "/images/manicure.jpg",
  },
  {
    title: "European Facial",
    vendor: "Glow Aesthetics",
    location: "Miami, FL",
    price: 90,
    rating: 4.7,
    image: "/images/facial.jpg",
  },
  {
    title: "Yoga Class Drop-in",
    vendor: "Zen Garden Yoga",
    location: "San Francisco, CA",
    price: 25,
    rating: 4.9,
    image: "/images/yoga.jpg",
  },
  {
    title: "Personal Training Session",
    vendor: "FitHub Gym",
    location: "Austin, TX",
    price: 80,
    rating: 5.0,
    image: "/images/training.jpg",
  },
];

export default function SearchPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Find Your Next Experience</h1>
        <p className="mt-2 text-lg text-muted-foreground">Search for services, vendors, and locations.</p>
      </div>
      <Card className="p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Input type="search" placeholder="Search for services..." className="h-12" />
          </div>
          <Select>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beauty">Beauty & Spa</SelectItem>
              <SelectItem value="fitness">Fitness & Wellness</SelectItem>
              <SelectItem value="tutors">Tutors & Classes</SelectItem>
            </SelectContent>
          </Select>
          <Button size="lg" className="h-12">
            <Search className="h-5 w-5 mr-2" /> Search
          </Button>
        </div>
      </Card>

      <div>
        <h2 className="text-2xl font-bold mb-4">Showing 6 results</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {searchResults.map((result, index) => (
            <Card key={index} className="overflow-hidden">
              <Image src={result.image} alt={result.title} width={400} height={250} className="w-full h-48 object-cover" />
              <CardContent className="p-4">
                <h3 className="text-lg font-semibold mb-1">{result.title}</h3>
                <p className="text-sm text-muted-foreground mb-2">{result.vendor}</p>
                <div className="flex items-center justify-between">
                  <p className="font-bold text-lg">${result.price}</p>
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400 mr-1" />
                    <span className="text-sm font-semibold">{result.rating}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
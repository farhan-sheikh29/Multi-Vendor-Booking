"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";

const bookings = [
  {
    service: "Luxury Haircut & Style",
    vendor: "The Gentleman's Cut",
    date: "2024-08-20 at 2:00 PM",
    status: "upcoming",
    image: "/images/haircut.jpg",
    price: 75,
  },
  {
    service: "Deep Tissue Massage",
    vendor: "Serenity Spa",
    date: "2024-07-15 at 4:30 PM",
    status: "completed",
    image: "/images/massage.jpg",
    price: 120,
  },
  {
    service: "Gel Manicure",
    vendor: "Nail Artistry",
    date: "2024-07-10 at 11:00 AM",
    status: "cancelled",
    image: "/images/manicure.jpg",
    price: 45,
  },
  {
    service: "Yoga Class Drop-in",
    vendor: "Zen Garden Yoga",
    date: "2024-08-22 at 6:00 PM",
    status: "upcoming",
    image: "/images/yoga.jpg",
    price: 25,
  },
];

export default function CustomerBookings() {
  const upcomingBookings = bookings.filter((b) => b.status === "upcoming");
  const completedBookings = bookings.filter((b) => b.status === "completed");
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">My Bookings</h1>
        <p className="mt-2 text-lg text-muted-foreground">View your upcoming and past bookings.</p>
      </div>
      <Tabs defaultValue="upcoming">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming">
          <BookingList bookings={upcomingBookings} />
        </TabsContent>
        <TabsContent value="completed">
          <BookingList bookings={completedBookings} />
        </TabsContent>
        <TabsContent value="cancelled">
          <BookingList bookings={cancelledBookings} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function BookingList({ bookings }: { bookings: Array<{ service: string; vendor: string; date: string; status: string; image: string; price: number }> }) {
  if (bookings.length === 0) {
    return <p className="text-center text-muted-foreground mt-8">No bookings in this category.</p>;
  }
  return (
    <div className="space-y-4 mt-4">
      {bookings.map((booking, index) => (
        <Card key={index}>
          <CardContent className="p-4 flex items-center space-x-4">
            <Image src={booking.image} alt={booking.service} width={128} height={128} className="rounded-md w-32 h-32 object-cover" />
            <div className="flex-1">
              <Badge variant={booking.status === 'upcoming' ? 'default' : booking.status === 'completed' ? 'secondary' : 'destructive'}>{booking.status}</Badge>
              <h3 className="text-xl font-semibold mt-1">{booking.service}</h3>
              <p className="text-muted-foreground">with {booking.vendor}</p>
              <p className="font-semibold mt-2">{booking.date}</p>
            </div>
            <div className="text-right">
              <p className="text-xl font-bold">${booking.price}</p>
              {booking.status === 'upcoming' && (
                <div className="flex flex-col space-y-2 mt-2">
                  <Button variant="outline">Reschedule</Button>
                  <Button variant="destructive">Cancel</Button>
                </div>
              )}
              {booking.status === 'completed' && (
                <Button className="mt-2">Leave a Review</Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
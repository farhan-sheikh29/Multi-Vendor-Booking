"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const teamMembers = [
  { name: "John Doe", role: "CEO & Founder", image: "/images/avatars/01.png" },
  { name: "Jane Smith", role: "CTO", image: "/images/avatars/02.png" },
  { name: "Peter Jones", role: "Head of Marketing", image: "/images/avatars/03.png" },
  { name: "Alice Williams", role: "Lead Designer", image: "/images/avatars/04.png" },
];

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <section className="text-center mb-16">
        <h1 className="text-5xl font-bold tracking-tight">About Us</h1>
        <p className="mt-4 text-xl text-muted-foreground max-w-3xl mx-auto">Our mission is to empower local businesses and connect customers with the best service providers in their area, seamlessly.</p>
      </section>

      <section className="mb-16">
        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Our Story</CardTitle>
          </CardHeader>
          <CardContent className="text-lg text-muted-foreground space-y-4">
            <p>Founded in 2024, our platform was born from a simple idea: to make finding and booking local services as easy as possible. We saw the challenges faced by both customers searching for reliable professionals and small businesses struggling to reach a wider audience.</p>
            <p>We are passionate about building a community where quality service and convenience meet. Our platform is more than just a booking tool; it's a space for connection, growth, and support for local economies.</p>
          </CardContent>
        </Card>
      </section>

      <section className="text-center mb-16">
        <h2 className="text-4xl font-bold mb-8">Meet Our Team</h2>
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member) => (
            <div key={member.name} className="flex flex-col items-center">
              <Avatar className="w-32 h-32 mb-4">
                <AvatarImage src={member.image} alt={member.name} />
                <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <p className="text-muted-foreground">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="text-center bg-secondary py-16 rounded-lg">
        <h2 className="text-4xl font-bold mb-4">Join Our Community</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">Whether you're a business looking to grow or a customer seeking top-notch services, we invite you to be a part of our journey.</p>
        <div className="flex justify-center gap-4">
          <Button size="lg">Browse Services</Button>
          <Button size="lg" variant="outline">Become a Vendor</Button>
        </div>
      </section>
    </div>
  );
}
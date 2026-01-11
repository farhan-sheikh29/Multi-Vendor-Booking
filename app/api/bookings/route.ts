import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { lockTimeSlot, releaseTimeSlot } from '@/lib/scheduling';
import { createPaymentIntent } from '@/lib/stripe';
import { sendBookingConfirmation, sendVendorNewBooking } from '@/lib/email';
import { createGoogleCalendarEvent } from '@/lib/calendar-google';
import { createOutlookCalendarEvent } from '@/lib/calendar-outlook';
import { z } from 'zod';
import { addMinutes } from 'date-fns';

const createBookingSchema = z.object({
    vendorId: z.string(),
    serviceId: z.string(),
    startTime: z.string().datetime(),
    notes: z.string().optional(),
    sessionId: z.string(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = createBookingSchema.parse(body);

        // Get service details
        const service = await prisma.service.findUnique({
            where: { id: validatedData.serviceId },
            include: {
                vendor: {
                    include: {
                        user: true,
                    },
                },
            },
        });

        if (!service) {
            return NextResponse.json({ error: 'Service not found' }, { status: 404 });
        }

        if (!service.isActive) {
            return NextResponse.json({ error: 'Service is not active' }, { status: 400 });
        }

        const startTime = new Date(validatedData.startTime);
        const endTime = addMinutes(startTime, service.duration);

        // Lock the time slot
        const lockResult = await lockTimeSlot(
            validatedData.vendorId,
            startTime,
            validatedData.sessionId
        );

        if (!lockResult.success) {
            return NextResponse.json(
                { error: lockResult.message || 'Unable to lock time slot' },
                { status: 409 }
            );
        }

        try {
            // Create payment intent
            const paymentIntent = await createPaymentIntent(
                Number(service.price),
                service.currency,
                {
                    customerId: session.user.id,
                    vendorId: validatedData.vendorId,
                    serviceId: validatedData.serviceId,
                    bookingStartTime: startTime.toISOString(),
                }
            );

            // Create booking
            const booking = await prisma.booking.create({
                data: {
                    customerId: session.user.id,
                    vendorId: validatedData.vendorId,
                    serviceId: validatedData.serviceId,
                    startTime,
                    endTime,
                    notes: validatedData.notes,
                    totalAmount: service.price,
                    status: 'PENDING',
                    paymentStatus: 'PENDING',
                    payment: {
                        create: {
                            stripePaymentId: paymentIntent.id,
                            amount: service.price,
                            currency: service.currency,
                            status: 'PENDING',
                        },
                    },
                },
                include: {
                    customer: true,
                    vendor: {
                        include: {
                            user: true,
                        },
                    },
                    service: true,
                },
            });

            // Release the lock (booking created successfully)
            await releaseTimeSlot(
                validatedData.vendorId,
                startTime,
                validatedData.sessionId
            );

            // Send notifications (async, don't wait)
            Promise.all([
                sendBookingConfirmation(
                    session.user.email,
                    session.user.name,
                    service.vendor.businessName,
                    service.name,
                    startTime,
                    endTime,
                    booking.id
                ),
                sendVendorNewBooking(
                    service.vendor.user.email,
                    service.vendor.businessName,
                    session.user.name,
                    service.name,
                    startTime,
                    booking.id
                ),
            ]).catch((error) => console.error('Email notification error:', error));

            // Sync to calendars (async, don't wait)
            Promise.all([
                service.vendor.googleRefreshToken
                    ? createGoogleCalendarEvent(validatedData.vendorId, {
                        summary: `${service.name} - ${session.user.name}`,
                        description: validatedData.notes,
                        startTime,
                        endTime,
                        attendees: [session.user.email],
                    })
                    : Promise.resolve(),
                service.vendor.outlookRefreshToken
                    ? createOutlookCalendarEvent(validatedData.vendorId, {
                        subject: `${service.name} - ${session.user.name}`,
                        body: validatedData.notes,
                        startTime,
                        endTime,
                        attendees: [session.user.email],
                    })
                    : Promise.resolve(),
            ]).catch((error) => console.error('Calendar sync error:', error));

            return NextResponse.json({
                booking,
                clientSecret: paymentIntent.client_secret,
            });
        } catch (error) {
            // Release lock on error
            await releaseTimeSlot(
                validatedData.vendorId,
                startTime,
                validatedData.sessionId
            );
            throw error;
        }
    } catch (error) {
        console.error('Create booking error:', error);

        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid request data', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Failed to create booking' },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        const where: any = {};

        if (session.user.role === 'CUSTOMER') {
            where.customerId = session.user.id;
        } else if (session.user.role === 'VENDOR') {
            const vendor = await prisma.vendor.findUnique({
                where: { userId: session.user.id },
            });

            if (!vendor) {
                return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
            }

            where.vendorId = vendor.id;
        }

        if (status) {
            where.status = status;
        }

        const bookings = await prisma.booking.findMany({
            where,
            include: {
                customer: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                vendor: {
                    select: {
                        id: true,
                        businessName: true,
                        phone: true,
                    },
                },
                service: {
                    select: {
                        id: true,
                        name: true,
                        duration: true,
                        price: true,
                    },
                },
                payment: true,
            },
            orderBy: {
                startTime: 'desc',
            },
        });

        return NextResponse.json({ bookings });
    } catch (error) {
        console.error('Get bookings error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch bookings' },
            { status: 500 }
        );
    }
}

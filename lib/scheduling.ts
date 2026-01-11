import { prisma } from './prisma';
import { lockSlot, unlockSlot, isSlotLocked } from './redis';
import { addMinutes, format, parse, isWithinInterval, areIntervalsOverlapping } from 'date-fns';

export interface TimeSlot {
    startTime: Date;
    endTime: Date;
    available: boolean;
    locked?: boolean;
}

export interface AvailabilityParams {
    vendorId: string;
    date: Date;
    serviceDuration: number;
}

/**
 * Get available time slots for a vendor on a specific date
 */
export async function getAvailableSlots({
    vendorId,
    date,
    serviceDuration,
}: AvailabilityParams): Promise<TimeSlot[]> {
    const dayOfWeek = date.getDay();
    const dateStr = format(date, 'yyyy-MM-dd');

    // Check for special hours (days off or custom hours)
    const specialHours = await prisma.specialHours.findUnique({
        where: {
            vendorId_date: {
                vendorId,
                date: new Date(dateStr),
            },
        },
    });

    // If it's a day off
    if (specialHours && !specialHours.startTime) {
        return [];
    }

    // Get regular availability or special hours
    let workingHours: { startTime: string; endTime: string } | null = null;

    if (specialHours) {
        workingHours = {
            startTime: specialHours.startTime!,
            endTime: specialHours.endTime!,
        };
    } else {
        const regularAvailability = await prisma.vendorAvailability.findFirst({
            where: {
                vendorId,
                dayOfWeek,
                isActive: true,
            },
        });

        if (!regularAvailability) {
            return [];
        }

        workingHours = {
            startTime: regularAvailability.startTime,
            endTime: regularAvailability.endTime,
        };
    }

    // Parse working hours
    const startTime = parse(workingHours.startTime, 'HH:mm', date);
    const endTime = parse(workingHours.endTime, 'HH:mm', date);

    // Get existing bookings for the day
    const existingBookings = await prisma.booking.findMany({
        where: {
            vendorId,
            startTime: {
                gte: new Date(dateStr),
                lt: new Date(new Date(dateStr).setDate(new Date(dateStr).getDate() + 1)),
            },
            status: {
                in: ['PENDING', 'CONFIRMED'],
            },
        },
        select: {
            startTime: true,
            endTime: true,
        },
    });

    // Generate all possible slots
    const slots: TimeSlot[] = [];
    let currentSlot = startTime;

    while (addMinutes(currentSlot, serviceDuration) <= endTime) {
        const slotEnd = addMinutes(currentSlot, serviceDuration);

        // Check if slot overlaps with existing bookings
        const hasConflict = existingBookings.some((booking) =>
            areIntervalsOverlapping(
                { start: currentSlot, end: slotEnd },
                { start: new Date(booking.startTime), end: new Date(booking.endTime) },
                { inclusive: false }
            )
        );

        // Check if slot is locked in Redis
        const locked = await isSlotLocked(vendorId, currentSlot);

        slots.push({
            startTime: new Date(currentSlot),
            endTime: new Date(slotEnd),
            available: !hasConflict && !locked,
            locked,
        });

        currentSlot = addMinutes(currentSlot, 30); // 30-minute intervals
    }

    return slots;
}

/**
 * Check if a specific time slot is available
 */
export async function isSlotAvailable(
    vendorId: string,
    startTime: Date,
    endTime: Date
): Promise<boolean> {
    // Check for existing bookings
    const conflictingBooking = await prisma.booking.findFirst({
        where: {
            vendorId,
            status: {
                in: ['PENDING', 'CONFIRMED'],
            },
            OR: [
                {
                    AND: [
                        { startTime: { lte: startTime } },
                        { endTime: { gt: startTime } },
                    ],
                },
                {
                    AND: [
                        { startTime: { lt: endTime } },
                        { endTime: { gte: endTime } },
                    ],
                },
                {
                    AND: [
                        { startTime: { gte: startTime } },
                        { endTime: { lte: endTime } },
                    ],
                },
            ],
        },
    });

    if (conflictingBooking) {
        return false;
    }

    // Check if slot is locked
    const locked = await isSlotLocked(vendorId, startTime);
    return !locked;
}

/**
 * Lock a time slot for booking
 */
export async function lockTimeSlot(
    vendorId: string,
    startTime: Date,
    sessionId: string
): Promise<{ success: boolean; message?: string }> {
    // First check if slot is available
    const available = await isSlotAvailable(vendorId, startTime, addMinutes(startTime, 30));

    if (!available) {
        return {
            success: false,
            message: 'This time slot is no longer available',
        };
    }

    // Try to lock the slot
    const locked = await lockSlot(vendorId, startTime, sessionId);

    if (!locked) {
        return {
            success: false,
            message: 'Unable to lock this time slot. Please try again.',
        };
    }

    return { success: true };
}

/**
 * Release a locked time slot
 */
export async function releaseTimeSlot(
    vendorId: string,
    startTime: Date,
    sessionId: string
): Promise<boolean> {
    return await unlockSlot(vendorId, startTime, sessionId);
}

/**
 * Get vendor's upcoming bookings
 */
export async function getVendorBookings(vendorId: string, limit: number = 10) {
    return await prisma.booking.findMany({
        where: {
            vendorId,
            startTime: {
                gte: new Date(),
            },
            status: {
                in: ['PENDING', 'CONFIRMED'],
            },
        },
        include: {
            customer: {
                select: {
                    id: true,
                    name: true,
                    email: true,
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
        },
        orderBy: {
            startTime: 'asc',
        },
        take: limit,
    });
}

/**
 * Get customer's booking history
 */
export async function getCustomerBookings(customerId: string) {
    return await prisma.booking.findMany({
        where: {
            customerId,
        },
        include: {
            vendor: {
                select: {
                    id: true,
                    businessName: true,
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
        },
        orderBy: {
            startTime: 'desc',
        },
    });
}

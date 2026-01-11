import { google } from 'googleapis';
import { prisma } from './prisma';

const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/google/callback`
);

/**
 * Get authorization URL for Google Calendar
 */
export function getGoogleAuthUrl(vendorId: string): string {
    const scopes = ['https://www.googleapis.com/auth/calendar'];

    return oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
        state: vendorId,
        prompt: 'consent',
    });
}

/**
 * Exchange authorization code for tokens
 */
export async function getGoogleTokens(code: string) {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
}

/**
 * Create event in Google Calendar
 */
export async function createGoogleCalendarEvent(
    vendorId: string,
    eventData: {
        summary: string;
        description?: string;
        startTime: Date;
        endTime: Date;
        attendees?: string[];
    }
) {
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
            select: { googleRefreshToken: true, googleCalendarId: true },
        });

        if (!vendor?.googleRefreshToken) {
            throw new Error('Google Calendar not connected');
        }

        oauth2Client.setCredentials({
            refresh_token: vendor.googleRefreshToken,
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const event = {
            summary: eventData.summary,
            description: eventData.description,
            start: {
                dateTime: eventData.startTime.toISOString(),
                timeZone: 'UTC',
            },
            end: {
                dateTime: eventData.endTime.toISOString(),
                timeZone: 'UTC',
            },
            attendees: eventData.attendees?.map((email) => ({ email })),
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'email', minutes: 24 * 60 },
                    { method: 'popup', minutes: 30 },
                ],
            },
        };

        const response = await calendar.events.insert({
            calendarId: vendor.googleCalendarId || 'primary',
            requestBody: event,
            sendUpdates: 'all',
        });

        return response.data;
    } catch (error) {
        console.error('Google Calendar error:', error);
        throw error;
    }
}

/**
 * Update event in Google Calendar
 */
export async function updateGoogleCalendarEvent(
    vendorId: string,
    eventId: string,
    eventData: {
        summary?: string;
        description?: string;
        startTime?: Date;
        endTime?: Date;
    }
) {
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
            select: { googleRefreshToken: true, googleCalendarId: true },
        });

        if (!vendor?.googleRefreshToken) {
            throw new Error('Google Calendar not connected');
        }

        oauth2Client.setCredentials({
            refresh_token: vendor.googleRefreshToken,
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        const event: any = {};

        if (eventData.summary) event.summary = eventData.summary;
        if (eventData.description) event.description = eventData.description;
        if (eventData.startTime) {
            event.start = {
                dateTime: eventData.startTime.toISOString(),
                timeZone: 'UTC',
            };
        }
        if (eventData.endTime) {
            event.end = {
                dateTime: eventData.endTime.toISOString(),
                timeZone: 'UTC',
            };
        }

        const response = await calendar.events.patch({
            calendarId: vendor.googleCalendarId || 'primary',
            eventId,
            requestBody: event,
            sendUpdates: 'all',
        });

        return response.data;
    } catch (error) {
        console.error('Google Calendar update error:', error);
        throw error;
    }
}

/**
 * Delete event from Google Calendar
 */
export async function deleteGoogleCalendarEvent(
    vendorId: string,
    eventId: string
) {
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
            select: { googleRefreshToken: true, googleCalendarId: true },
        });

        if (!vendor?.googleRefreshToken) {
            throw new Error('Google Calendar not connected');
        }

        oauth2Client.setCredentials({
            refresh_token: vendor.googleRefreshToken,
        });

        const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

        await calendar.events.delete({
            calendarId: vendor.googleCalendarId || 'primary',
            eventId,
            sendUpdates: 'all',
        });

        return { success: true };
    } catch (error) {
        console.error('Google Calendar delete error:', error);
        throw error;
    }
}

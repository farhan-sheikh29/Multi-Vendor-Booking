import axios from 'axios';
import { prisma } from './prisma';

const MICROSOFT_GRAPH_API = 'https://graph.microsoft.com/v1.0';

/**
 * Get authorization URL for Outlook Calendar
 */
export function getOutlookAuthUrl(vendorId: string): string {
    const scopes = ['Calendars.ReadWrite', 'offline_access'];
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/outlook/callback`;

    return `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/authorize?` +
        `client_id=${process.env.MICROSOFT_CLIENT_ID}` +
        `&response_type=code` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&scope=${encodeURIComponent(scopes.join(' '))}` +
        `&state=${vendorId}` +
        `&prompt=consent`;
}

/**
 * Exchange authorization code for tokens
 */
export async function getOutlookTokens(code: string) {
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/calendar/outlook/callback`;

    const response = await axios.post(
        `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
        new URLSearchParams({
            client_id: process.env.MICROSOFT_CLIENT_ID!,
            client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
            code,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code',
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );

    return response.data;
}

/**
 * Refresh Outlook access token
 */
async function refreshOutlookToken(refreshToken: string) {
    const response = await axios.post(
        `https://login.microsoftonline.com/${process.env.MICROSOFT_TENANT_ID}/oauth2/v2.0/token`,
        new URLSearchParams({
            client_id: process.env.MICROSOFT_CLIENT_ID!,
            client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
            refresh_token: refreshToken,
            grant_type: 'refresh_token',
        }),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        }
    );

    return response.data.access_token;
}

/**
 * Create event in Outlook Calendar
 */
export async function createOutlookCalendarEvent(
    vendorId: string,
    eventData: {
        subject: string;
        body?: string;
        startTime: Date;
        endTime: Date;
        attendees?: string[];
    }
) {
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
            select: { outlookRefreshToken: true },
        });

        if (!vendor?.outlookRefreshToken) {
            throw new Error('Outlook Calendar not connected');
        }

        const accessToken = await refreshOutlookToken(vendor.outlookRefreshToken);

        const event = {
            subject: eventData.subject,
            body: {
                contentType: 'HTML',
                content: eventData.body || '',
            },
            start: {
                dateTime: eventData.startTime.toISOString(),
                timeZone: 'UTC',
            },
            end: {
                dateTime: eventData.endTime.toISOString(),
                timeZone: 'UTC',
            },
            attendees: eventData.attendees?.map((email) => ({
                emailAddress: { address: email },
                type: 'required',
            })),
            reminderMinutesBeforeStart: 30,
        };

        const response = await axios.post(
            `${MICROSOFT_GRAPH_API}/me/calendar/events`,
            event,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Outlook Calendar error:', error);
        throw error;
    }
}

/**
 * Update event in Outlook Calendar
 */
export async function updateOutlookCalendarEvent(
    vendorId: string,
    eventId: string,
    eventData: {
        subject?: string;
        body?: string;
        startTime?: Date;
        endTime?: Date;
    }
) {
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
            select: { outlookRefreshToken: true },
        });

        if (!vendor?.outlookRefreshToken) {
            throw new Error('Outlook Calendar not connected');
        }

        const accessToken = await refreshOutlookToken(vendor.outlookRefreshToken);

        const event: any = {};

        if (eventData.subject) event.subject = eventData.subject;
        if (eventData.body) {
            event.body = {
                contentType: 'HTML',
                content: eventData.body,
            };
        }
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

        const response = await axios.patch(
            `${MICROSOFT_GRAPH_API}/me/calendar/events/${eventId}`,
            event,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                },
            }
        );

        return response.data;
    } catch (error) {
        console.error('Outlook Calendar update error:', error);
        throw error;
    }
}

/**
 * Delete event from Outlook Calendar
 */
export async function deleteOutlookCalendarEvent(
    vendorId: string,
    eventId: string
) {
    try {
        const vendor = await prisma.vendor.findUnique({
            where: { id: vendorId },
            select: { outlookRefreshToken: true },
        });

        if (!vendor?.outlookRefreshToken) {
            throw new Error('Outlook Calendar not connected');
        }

        const accessToken = await refreshOutlookToken(vendor.outlookRefreshToken);

        await axios.delete(
            `${MICROSOFT_GRAPH_API}/me/calendar/events/${eventId}`,
            {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }
        );

        return { success: true };
    } catch (error) {
        console.error('Outlook Calendar delete error:', error);
        throw error;
    }
}

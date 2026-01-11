import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = process.env.EMAIL_FROM || 'noreply@bookinghub.com';

interface EmailOptions {
    to: string;
    subject: string;
    html: string;
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
    try {
        const data = await resend.emails.send({
            from: FROM_EMAIL,
            to,
            subject,
            html,
        });
        return { success: true, data };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error };
    }
}

export async function sendBookingConfirmation(
    customerEmail: string,
    customerName: string,
    vendorName: string,
    serviceName: string,
    startTime: Date,
    endTime: Date,
    bookingId: string
) {
    const subject = 'Booking Confirmation';
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
          .detail-label { font-weight: bold; color: #6b7280; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hi ${customerName},</p>
            <p>Your booking has been confirmed. Here are the details:</p>
            
            <div class="booking-details">
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span>${bookingId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span>${serviceName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Vendor:</span>
                <span>${vendorName}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Date & Time:</span>
                <span>${startTime.toLocaleString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit'
    })}</span>
              </div>
            </div>
            
            <p>We look forward to seeing you!</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings/${bookingId}" class="button">View Booking</a>
            
            <div class="footer">
              <p>If you have any questions, please contact us.</p>
              <p>&copy; ${new Date().getFullYear()} BookingHub. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

    return sendEmail({ to: customerEmail, subject, html });
}

export async function sendBookingCancellation(
    customerEmail: string,
    customerName: string,
    serviceName: string,
    startTime: Date,
    reason?: string
) {
    const subject = 'Booking Cancelled';
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #ef4444; color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Cancelled</h1>
          </div>
          <div class="content">
            <p>Hi ${customerName},</p>
            <p>Your booking for <strong>${serviceName}</strong> on ${startTime.toLocaleString()} has been cancelled.</p>
            ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
            <p>If you have any questions, please contact us.</p>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} BookingHub. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

    return sendEmail({ to: customerEmail, subject, html });
}

export async function sendVendorNewBooking(
    vendorEmail: string,
    vendorName: string,
    customerName: string,
    serviceName: string,
    startTime: Date,
    bookingId: string
) {
    const subject = 'New Booking Received';
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #6b7280; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Booking!</h1>
          </div>
          <div class="content">
            <p>Hi ${vendorName},</p>
            <p>You have a new booking from <strong>${customerName}</strong>.</p>
            <p><strong>Service:</strong> ${serviceName}</p>
            <p><strong>Date & Time:</strong> ${startTime.toLocaleString()}</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/vendor/bookings/${bookingId}" class="button">View Booking</a>
            
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} BookingHub. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;

    return sendEmail({ to: vendorEmail, subject, html });
}

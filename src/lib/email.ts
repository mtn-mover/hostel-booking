import nodemailer from 'nodemailer'

// Email configuration
const transporter = nodemailer.createTransporter({
  host: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_SERVER_USER,
    pass: process.env.EMAIL_SERVER_PASSWORD,
  },
})

// Email templates
export const emailTemplates = {
  bookingConfirmation: (booking: any) => ({
    subject: `Booking Confirmed - ${booking.apartment.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
          <h1 style="color: #2563eb; margin-bottom: 20px;">Booking Confirmed! 🎉</h1>
          
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h2 style="color: #1f2937; margin-bottom: 16px;">${booking.apartment.name}</h2>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 20px;">
              <div>
                <strong>Check-in:</strong><br>
                ${booking.checkIn.toLocaleDateString()}
              </div>
              <div>
                <strong>Check-out:</strong><br>
                ${booking.checkOut.toLocaleDateString()}
              </div>
              <div>
                <strong>Guests:</strong><br>
                ${booking.guests}
              </div>
              <div>
                <strong>Total:</strong><br>
                <span style="color: #059669; font-weight: bold;">$${booking.totalPrice}</span>
              </div>
            </div>
            
            <div style="background: #f3f4f6; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
              <strong>Booking ID:</strong> ${booking.id}<br>
              <strong>Guest:</strong> ${booking.guestName}<br>
              <strong>Email:</strong> ${booking.guestEmail}
              ${booking.guestPhone ? `<br><strong>Phone:</strong> ${booking.guestPhone}` : ''}
            </div>
            
            ${booking.specialRequests ? `
              <div style="background: #fef3c7; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
                <strong>Special Requests:</strong><br>
                ${booking.specialRequests}
              </div>
            ` : ''}
          </div>
          
          <div style="background: #e0f2fe; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <h3 style="margin-top: 0; color: #0369a1;">Important Information</h3>
            <ul style="margin: 0; padding-left: 20px;">
              <li>Check-in time: 3:00 PM - 8:00 PM</li>
              <li>Check-out time: 11:00 AM</li>
              <li>Please bring a valid ID for check-in</li>
              <li>Free cancellation up to 24 hours before check-in</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="${process.env.NEXTAUTH_URL}/booking/confirmation?bookingId=${booking.id}" 
               style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Booking Details
            </a>
          </div>
          
          <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px;">
            Need help? Contact us via WhatsApp: 
            <a href="https://wa.me/41798016570" style="color: #2563eb;">+41 79 801 65 70</a>
          </p>
        </div>
      </div>
    `
  }),
  
  bookingCancellation: (booking: any) => ({
    subject: `Booking Cancelled - ${booking.apartment.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px;">
          <h1 style="color: #dc2626; margin-bottom: 20px;">Booking Cancelled</h1>
          
          <div style="background: white; padding: 20px; border-radius: 8px;">
            <h2 style="color: #1f2937; margin-bottom: 16px;">${booking.apartment.name}</h2>
            
            <p>Your booking has been cancelled:</p>
            
            <div style="background: #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
              <strong>Booking ID:</strong> ${booking.id}<br>
              <strong>Dates:</strong> ${booking.checkIn.toLocaleDateString()} - ${booking.checkOut.toLocaleDateString()}<br>
              <strong>Amount:</strong> $${booking.totalPrice}
              ${booking.cancellationReason ? `<br><strong>Reason:</strong> ${booking.cancellationReason}` : ''}
            </div>
            
            <p>If payment was processed, your refund will be issued within 5-7 business days.</p>
          </div>
          
          <p style="text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px;">
            Need help? Contact us via WhatsApp: 
            <a href="https://wa.me/41798016570" style="color: #2563eb;">+41 79 801 65 70</a>
          </p>
        </div>
      </div>
    `
  })
}

// Send email function
export async function sendEmail(to: string, template: { subject: string; html: string }) {
  if (!process.env.EMAIL_SERVER_USER || !process.env.EMAIL_SERVER_PASSWORD) {
    console.log('Email not configured, skipping email send')
    return { success: false, error: 'Email not configured' }
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@hostlopia.com',
      to,
      subject: template.subject,
      html: template.html,
    })

    console.log('Email sent:', info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

// Booking notification functions
export async function sendBookingConfirmationEmail(booking: any) {
  const template = emailTemplates.bookingConfirmation(booking)
  return sendEmail(booking.guestEmail, template)
}

export async function sendBookingCancellationEmail(booking: any) {
  const template = emailTemplates.bookingCancellation(booking)
  return sendEmail(booking.guestEmail, template)
}
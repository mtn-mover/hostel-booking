import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { sendEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { to, type } = await request.json()

    if (!to) {
      return NextResponse.json(
        { success: false, error: 'Email address is required' },
        { status: 400 }
      )
    }

    const testTemplate = {
      subject: '🧪 Test Email from HOSTLOPIA',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
            <h1 style="color: #2563eb; margin-bottom: 20px;">Test Email Successful! ✅</h1>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p>This is a test email from your HOSTLOPIA Management System.</p>
              <p>If you received this email, your email configuration is working correctly!</p>
              
              <div style="background: #e0f2fe; padding: 16px; border-radius: 6px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #0369a1;">System Information:</h3>
                <ul style="margin: 0; padding-left: 20px;">
                  <li>Sent at: ${new Date().toLocaleString()}</li>
                  <li>From: Admin Panel</li>
                  <li>System: HOSTLOPIA v1.0.0</li>
                </ul>
              </div>
            </div>
            
            <p style="text-align: center; color: #6b7280; font-size: 14px;">
              This is an automated test email. Please do not reply.
            </p>
          </div>
        </div>
      `
    }

    const result = await sendEmail(to, testTemplate)

    return NextResponse.json(result)

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
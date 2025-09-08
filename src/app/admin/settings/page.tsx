'use client'

import { useState } from 'react'

export default function AdminSettings() {
  const [emailConfig, setEmailConfig] = useState({
    host: process.env.EMAIL_SERVER_HOST || '',
    port: process.env.EMAIL_SERVER_PORT || '587',
    user: process.env.EMAIL_SERVER_USER || '',
    from: process.env.EMAIL_FROM || ''
  })
  
  const [testEmail, setTestEmail] = useState('')
  const [isTestingEmail, setIsTestingEmail] = useState(false)
  const [testResult, setTestResult] = useState('')

  const handleTestEmail = async () => {
    if (!testEmail) {
      setTestResult('Please enter an email address')
      return
    }

    setIsTestingEmail(true)
    setTestResult('')

    try {
      const response = await fetch('/api/admin/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: testEmail,
          type: 'test'
        }),
      })

      const result = await response.json()

      if (result.success) {
        setTestResult('✅ Test email sent successfully!')
      } else {
        setTestResult(`❌ Failed to send email: ${result.error}`)
      }
    } catch (error) {
      setTestResult(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTestingEmail(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-2 text-gray-600">Configure system settings and integrations</p>
      </div>

      {/* Email Configuration */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Email Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMTP Host
            </label>
            <input
              type="text"
              value={emailConfig.host}
              onChange={(e) => setEmailConfig(prev => ({ ...prev, host: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="smtp.gmail.com"
              disabled
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Port
              </label>
              <input
                type="text"
                value={emailConfig.port}
                onChange={(e) => setEmailConfig(prev => ({ ...prev, port: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Email
              </label>
              <input
                type="email"
                value={emailConfig.from}
                onChange={(e) => setEmailConfig(prev => ({ ...prev, from: e.target.value }))}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="noreply@hostel.com"
                disabled
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              SMTP Username
            </label>
            <input
              type="email"
              value={emailConfig.user}
              onChange={(e) => setEmailConfig(prev => ({ ...prev, user: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="your-email@gmail.com"
              disabled
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Email Configuration
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>Email settings are configured via environment variables in .env.local:</p>
                  <ul className="mt-2 list-disc list-inside">
                    <li>EMAIL_SERVER_HOST</li>
                    <li>EMAIL_SERVER_PORT</li>
                    <li>EMAIL_SERVER_USER</li>
                    <li>EMAIL_SERVER_PASSWORD</li>
                    <li>EMAIL_FROM</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Email Testing */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Test Email System</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Test Email Address
            </label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="test@example.com"
            />
          </div>

          <button
            onClick={handleTestEmail}
            disabled={isTestingEmail || !testEmail}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
          >
            {isTestingEmail ? 'Sending...' : 'Send Test Email'}
          </button>

          {testResult && (
            <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-sm">{testResult}</p>
            </div>
          )}
        </div>
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">System Information</h2>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Application</h3>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Version:</dt>
                <dd className="text-gray-900">1.0.0</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Environment:</dt>
                <dd className="text-gray-900">Development</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Database:</dt>
                <dd className="text-gray-900">SQLite</dd>
              </div>
            </dl>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Features</h3>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-600">Authentication:</dt>
                <dd className="text-green-600">✓ Enabled</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Payments:</dt>
                <dd className="text-green-600">✓ Stripe</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-600">Email:</dt>
                <dd className={emailConfig.user ? 'text-green-600' : 'text-yellow-600'}>
                  {emailConfig.user ? '✓ Configured' : '⚠ Not configured'}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  )
}
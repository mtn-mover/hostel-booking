'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ChatSettingsPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  
  // Default settings (you could load these from database)
  const [settings, setSettings] = useState({
    confidenceThreshold: 0.85,
    modelName: 'claude-3-haiku-20240307',
    temperature: 0.7,
    maxTokens: 1024,
    welcomeMessageDe: 'Hallo! Ich bin Ihr KI-Assistent für Heart of Interlaken Apartments. Wie kann ich Ihnen helfen? 😊',
    welcomeMessageEn: 'Hello! I am your AI assistant for Heart of Interlaken Apartments. How can I help you? 😊'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Here you would save to database via API
    console.log('Saving settings:', settings)
    
    // Simulate save
    setTimeout(() => {
      setIsLoading(false)
      alert('Settings saved successfully!')
    }, 1000)
  }

  const handleReset = () => {
    setSettings({
      confidenceThreshold: 0.85,
      modelName: 'claude-3-haiku-20240307',
      temperature: 0.7,
      maxTokens: 1024,
      welcomeMessageDe: 'Hallo! Ich bin Ihr KI-Assistent für Heart of Interlaken Apartments. Wie kann ich Ihnen helfen? 😊',
      welcomeMessageEn: 'Hello! I am your AI assistant for Heart of Interlaken Apartments. How can I help you? 😊'
    })
  }
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Chat Bot Settings</h1>
        <p className="mt-2 text-gray-600">Configure the AI chat assistant behavior and responses</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* AI Model Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">AI Model Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="modelName" className="block text-sm font-medium text-gray-700 mb-1">
                Claude Model
              </label>
              <select
                id="modelName"
                name="modelName"
                value={settings.modelName}
                onChange={(e) => setSettings({...settings, modelName: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="claude-3-haiku-20240307">Claude 3 Haiku (Fast & Economical)</option>
                <option value="claude-3-sonnet-20240229">Claude 3 Sonnet (Balanced)</option>
                <option value="claude-3-opus-20240229">Claude 3 Opus (Most Capable)</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">Choose the Claude model based on your needs</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="temperature" className="block text-sm font-medium text-gray-700 mb-1">
                  Temperature (0-1)
                </label>
                <input
                  type="number"
                  id="temperature"
                  name="temperature"
                  min="0"
                  max="1"
                  step="0.1"
                  value={settings.temperature}
                  onChange={(e) => setSettings({...settings, temperature: parseFloat(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Higher = more creative, Lower = more focused</p>
              </div>

              <div>
                <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700 mb-1">
                  Max Response Length
                </label>
                <input
                  type="number"
                  id="maxTokens"
                  name="maxTokens"
                  min="100"
                  max="4096"
                  value={settings.maxTokens}
                  onChange={(e) => setSettings({...settings, maxTokens: parseInt(e.target.value)})}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="mt-1 text-xs text-gray-500">Maximum tokens in response</p>
              </div>
            </div>
          </div>
        </div>

        {/* Escalation Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Escalation Settings</h2>
          
          <div>
            <label htmlFor="confidenceThreshold" className="block text-sm font-medium text-gray-700 mb-1">
              Confidence Threshold (%)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                id="confidenceThreshold"
                name="confidenceThreshold"
                min="0"
                max="1"
                step="0.05"
                value={settings.confidenceThreshold}
                onChange={(e) => setSettings({...settings, confidenceThreshold: parseFloat(e.target.value)})}
                className="flex-1"
              />
              <span className="text-sm font-medium text-gray-700 w-12">
                {(settings.confidenceThreshold * 100).toFixed(0)}%
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Messages with confidence below this threshold will be escalated to human support
            </p>
          </div>
        </div>

        {/* Welcome Messages */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Welcome Messages</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="welcomeMessageDe" className="block text-sm font-medium text-gray-700 mb-1">
                German Welcome Message
              </label>
              <textarea
                id="welcomeMessageDe"
                name="welcomeMessageDe"
                rows={3}
                value={settings.welcomeMessageDe}
                onChange={(e) => setSettings({...settings, welcomeMessageDe: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label htmlFor="welcomeMessageEn" className="block text-sm font-medium text-gray-700 mb-1">
                English Welcome Message
              </label>
              <textarea
                id="welcomeMessageEn"
                name="welcomeMessageEn"
                rows={3}
                value={settings.welcomeMessageEn}
                onChange={(e) => setSettings({...settings, welcomeMessageEn: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Knowledge Base Info */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold mb-4">Knowledge Base Information</h2>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p>The chat bot has access to the following knowledge categories:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>General hostel information (name, address, contact)</li>
              <li>Check-in/Check-out times and procedures</li>
              <li>WiFi and technical amenities</li>
              <li>Apartment details and pricing</li>
              <li>Location and transportation</li>
              <li>Local recommendations</li>
              <li>Policies and rules</li>
              <li>Emergency contacts</li>
            </ul>
            <p className="mt-4 text-xs text-gray-500">
              To modify the knowledge base, edit the file: src/lib/knowledge-base.ts
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
          >
            Reset
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { Settings, MessageSquare, BarChart3, Phone, Edit, Save, X } from 'lucide-react'

interface ChatLog {
  id: number
  timestamp: string
  userMessage: string
  assistantMessage: string
  language: string
  isEscalated?: boolean
}

export default function ChatAdminPage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'logs' | 'analytics'>('settings')
  const [isEditing, setIsEditing] = useState(false)
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([
    {
      id: 1,
      timestamp: new Date().toISOString(),
      userMessage: 'Wann ist Check-in?',
      assistantMessage: 'Check-in ist von 15:00-20:00 Uhr möglich...',
      language: 'de'
    },
    {
      id: 2,
      timestamp: new Date().toISOString(),
      userMessage: 'What is the WiFi password?',
      assistantMessage: 'WiFi network name is Heart-Interlaken-Guest...',
      language: 'en'
    }
  ])
  
  const [knowledgeBase, setKnowledgeBase] = useState({
    general: {
      name: 'Heart of Interlaken Apartments',
      phone: '+41 79 123 45 67',
      email: 'info@heart-interlaken.ch',
      emergencyPhone: '+41 79 123 45 67'
    },
    checkin: {
      standardTime: '15:00 - 20:00',
      lateCheckin: 'Nach 20:00 mit Voranmeldung möglich (CHF 30 Aufschlag)',
      checkoutTime: '11:00 Uhr'
    },
    wifi: {
      network: 'Heart-Interlaken-Guest',
      speed: '100 Mbps Glasfaser'
    },
    parking: {
      cost: 'CHF 15 pro Nacht',
      location: '100m vom Apartment entfernt',
      reservation: 'Voranmeldung erforderlich'
    }
  })
  
  const [editedKnowledgeBase, setEditedKnowledgeBase] = useState(knowledgeBase)
  
  const analytics = {
    totalChats: 156,
    germanChats: 98,
    englishChats: 58,
    escalations: 12,
    topQuestions: [
      { question: 'Check-in Zeit', count: 45 },
      { question: 'WiFi Passwort', count: 38 },
      { question: 'Parkplatz', count: 28 },
      { question: 'Restaurant Empfehlungen', count: 22 },
      { question: 'Jungfraujoch Tickets', count: 18 }
    ]
  }
  
  const handleSaveKnowledgeBase = () => {
    setKnowledgeBase(editedKnowledgeBase)
    setIsEditing(false)
    // In real app: save to backend/database
    console.log('Knowledge Base updated:', editedKnowledgeBase)
  }
  
  const handleCancelEdit = () => {
    setEditedKnowledgeBase(knowledgeBase)
    setIsEditing(false)
  }
  
  const updateNestedValue = (path: string[], value: string) => {
    setEditedKnowledgeBase(prev => {
      const updated = { ...prev }
      let current: any = updated
      
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]]
      }
      
      current[path[path.length - 1]] = value
      return updated
    })
  }
  
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <MessageSquare className="text-blue-600" size={28} />
            Chat Support Administration
          </h1>
          <p className="text-gray-600 mt-2">
            Verwalten Sie den KI-Chat-Support für Heart of Interlaken Apartments
          </p>
        </div>
        
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('settings')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings size={16} className="inline mr-2" />
                Knowledge Base
              </button>
              <button
                onClick={() => setActiveTab('logs')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'logs'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <MessageSquare size={16} className="inline mr-2" />
                Chat Verlauf
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-6 text-sm font-medium border-b-2 ${
                  activeTab === 'analytics'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <BarChart3 size={16} className="inline mr-2" />
                Analytics
              </button>
            </nav>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold">Knowledge Base Einstellungen</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Edit size={16} />
                      Bearbeiten
                    </button>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveKnowledgeBase}
                        className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <Save size={16} />
                        Speichern
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        <X size={16} />
                        Abbrechen
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Knowledge Base Forms */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* General Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Allgemeine Informationen</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                        <input
                          type="text"
                          value={isEditing ? editedKnowledgeBase.general.name : knowledgeBase.general.name}
                          onChange={(e) => updateNestedValue(['general', 'name'], e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                        <input
                          type="text"
                          value={isEditing ? editedKnowledgeBase.general.phone : knowledgeBase.general.phone}
                          onChange={(e) => updateNestedValue(['general', 'phone'], e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                        <input
                          type="email"
                          value={isEditing ? editedKnowledgeBase.general.email : knowledgeBase.general.email}
                          onChange={(e) => updateNestedValue(['general', 'email'], e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Check-in Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Check-in Informationen</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Standard Check-in Zeit</label>
                        <input
                          type="text"
                          value={isEditing ? editedKnowledgeBase.checkin.standardTime : knowledgeBase.checkin.standardTime}
                          onChange={(e) => updateNestedValue(['checkin', 'standardTime'], e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Late Check-in</label>
                        <input
                          type="text"
                          value={isEditing ? editedKnowledgeBase.checkin.lateCheckin : knowledgeBase.checkin.lateCheckin}
                          onChange={(e) => updateNestedValue(['checkin', 'lateCheckin'], e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Check-out Zeit</label>
                        <input
                          type="text"
                          value={isEditing ? editedKnowledgeBase.checkin.checkoutTime : knowledgeBase.checkin.checkoutTime}
                          onChange={(e) => updateNestedValue(['checkin', 'checkoutTime'], e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* WiFi Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">WLAN Informationen</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Netzwerk Name</label>
                        <input
                          type="text"
                          value={isEditing ? editedKnowledgeBase.wifi.network : knowledgeBase.wifi.network}
                          onChange={(e) => updateNestedValue(['wifi', 'network'], e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Geschwindigkeit</label>
                        <input
                          type="text"
                          value={isEditing ? editedKnowledgeBase.wifi.speed : knowledgeBase.wifi.speed}
                          onChange={(e) => updateNestedValue(['wifi', 'speed'], e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Parking Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-gray-900 mb-4">Parkplatz Informationen</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kosten</label>
                        <input
                          type="text"
                          value={isEditing ? editedKnowledgeBase.parking.cost : knowledgeBase.parking.cost}
                          onChange={(e) => updateNestedValue(['parking', 'cost'], e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Standort</label>
                        <input
                          type="text"
                          value={isEditing ? editedKnowledgeBase.parking.location : knowledgeBase.parking.location}
                          onChange={(e) => updateNestedValue(['parking', 'location'], e.target.value)}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Chat Logs Tab */}
            {activeTab === 'logs' && (
              <div className="space-y-4">
                <h2 className="text-lg font-semibold">Chat Verlauf (Letzten 100 Unterhaltungen)</h2>
                <div className="space-y-3">
                  {chatLogs.map((log) => (
                    <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm text-gray-500">
                          {new Date(log.timestamp).toLocaleString('de-CH')}
                        </span>
                        <div className="flex gap-2">
                          <span className={`px-2 py-1 text-xs rounded ${
                            log.language === 'de' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                          }`}>
                            {log.language.toUpperCase()}
                          </span>
                          {log.isEscalated && (
                            <span className="px-2 py-1 text-xs rounded bg-red-100 text-red-700 flex items-center gap-1">
                              <Phone size={10} />
                              Escalated
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="bg-blue-50 p-3 rounded">
                          <strong className="text-blue-700">User:</strong>
                          <p className="text-blue-800 mt-1">{log.userMessage}</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded">
                          <strong className="text-gray-700">Assistant:</strong>
                          <p className="text-gray-800 mt-1">{log.assistantMessage}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h2 className="text-lg font-semibold">Chat Analytics (Letzte 30 Tage)</h2>
                
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Total Chats</p>
                        <p className="text-2xl font-bold text-blue-700">{analytics.totalChats}</p>
                      </div>
                      <MessageSquare className="text-blue-500" size={24} />
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600 font-medium">Deutsch</p>
                        <p className="text-2xl font-bold text-green-700">{analytics.germanChats}</p>
                        <p className="text-xs text-green-600">{Math.round((analytics.germanChats / analytics.totalChats) * 100)}%</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">DE</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600 font-medium">English</p>
                        <p className="text-2xl font-bold text-purple-700">{analytics.englishChats}</p>
                        <p className="text-xs text-purple-600">{Math.round((analytics.englishChats / analytics.totalChats) * 100)}%</p>
                      </div>
                      <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center">
                        <span className="text-white text-xs font-bold">EN</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-red-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-600 font-medium">Escalations</p>
                        <p className="text-2xl font-bold text-red-700">{analytics.escalations}</p>
                        <p className="text-xs text-red-600">{Math.round((analytics.escalations / analytics.totalChats) * 100)}%</p>
                      </div>
                      <Phone className="text-red-500" size={24} />
                    </div>
                  </div>
                </div>
                
                {/* Top Questions */}
                <div className="bg-gray-50 p-6 rounded-lg">
                  <h3 className="font-semibold text-gray-900 mb-4">Häufigste Fragen</h3>
                  <div className="space-y-3">
                    {analytics.topQuestions.map((item, index) => (
                      <div key={index} className="flex justify-between items-center">
                        <span className="text-gray-700">{item.question}</span>
                        <div className="flex items-center gap-2">
                          <div className="bg-gray-200 rounded-full h-2 w-24">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(item.count / analytics.topQuestions[0].count) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-600 w-8">{item.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
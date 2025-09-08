'use client'

import { useState } from 'react'

interface Tab {
  id: string
  label: string
  icon: string
}

interface ApartmentEditTabsProps {
  activeTab: string
  onTabChange: (tabId: string) => void
}

export function ApartmentEditTabs({ activeTab, onTabChange }: ApartmentEditTabsProps) {
  const tabs: Tab[] = [
    { id: 'basic', label: 'Grunddaten', icon: '📝' },
    { id: 'location', label: 'Standort', icon: '📍' },
    { id: 'pricing', label: 'Preise', icon: '💰' },
    { id: 'amenities', label: 'Ausstattung', icon: '✨' },
    { id: 'images', label: 'Bilder', icon: '📷' },
    { id: 'availability', label: 'Verfügbarkeit', icon: '📅' },
    { id: 'integration', label: 'Integration', icon: '🔗' },
  ]

  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-1" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              group inline-flex items-center px-4 py-3 border-b-2 font-medium text-sm transition-all
              ${activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <span className="mr-2 text-lg">{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}
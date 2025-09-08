'use client'

import { useState, useEffect } from 'react'
import { Trash2, Plus, Save, Bot, User } from 'lucide-react'

interface QAPair {
  id: string
  question: string
  answer: string
  language: 'de' | 'en'
  category: string
  confidence: number
}

export default function TrainingPage() {
  const [qaPairs, setQaPairs] = useState<QAPair[]>([])
  const [newQA, setNewQA] = useState({
    question: '',
    answer: '',
    language: 'de' as 'de' | 'en',
    category: 'general'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [testQuestion, setTestQuestion] = useState('')
  const [testResponse, setTestResponse] = useState('')

  // Load existing Q&A pairs
  useEffect(() => {
    loadQAPairs()
  }, [])

  const loadQAPairs = async () => {
    try {
      const response = await fetch('/api/admin/training')
      if (response.ok) {
        const data = await response.json()
        setQaPairs(data.qaPairs || [])
      }
    } catch (error) {
      console.error('Error loading Q&A pairs:', error)
    }
  }

  const addQAPair = async () => {
    if (!newQA.question || !newQA.answer) {
      alert('Please fill in both question and answer')
      return
    }

    const newPair: QAPair = {
      id: Date.now().toString(),
      ...newQA,
      confidence: 1.0
    }

    // Save immediately to database
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qaPairs: [newPair] })
      })

      if (response.ok) {
        // Reload the list from database
        await loadQAPairs()
        // Clear the form
        setNewQA({
          question: '',
          answer: '',
          language: newQA.language,
          category: newQA.category
        })
        alert('Q&A pair saved successfully!')
      } else {
        alert('Error saving Q&A pair')
      }
    } catch (error) {
      console.error('Error saving Q&A pair:', error)
      alert('Error saving Q&A pair')
    }
    setIsLoading(false)
  }

  const deleteQAPair = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Q&A pair?')) return
    
    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/training?id=${id}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        await loadQAPairs()
      } else {
        alert('Error deleting Q&A pair')
      }
    } catch (error) {
      console.error('Error deleting Q&A pair:', error)
      alert('Error deleting Q&A pair')
    }
    setIsLoading(false)
  }

  const saveQAPairs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/training', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qaPairs })
      })

      if (response.ok) {
        alert('All training data saved successfully!')
        // Reload from database to show saved state
        await loadQAPairs()
      } else {
        alert('Error saving training data')
      }
    } catch (error) {
      console.error('Error saving Q&A pairs:', error)
      alert('Error saving training data')
    }
    setIsLoading(false)
  }

  const testChatBot = async () => {
    if (!testQuestion) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: testQuestion,
          sessionId: `test_${Date.now()}`,
          language: 'de'
        })
      })

      if (response.ok) {
        const data = await response.json()
        setTestResponse(data.response)
      }
    } catch (error) {
      console.error('Error testing chat bot:', error)
      setTestResponse('Error testing chat bot')
    }
    setIsLoading(false)
  }

  const categories = [
    'general',
    'checkin',
    'checkout',
    'fees',
    'wifi',
    'parking',
    'apartments',
    'pricing',
    'policies',
    'location',
    'amenities',
    'emergency',
    'heart1',
    'heart2',
    'heart3',
    'heart4',
    'heart5'
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Q&A Training</h1>
        <p className="mt-2 text-gray-600">
          Train the chat bot with specific question-answer pairs to improve its responses
        </p>
      </div>

      {/* Add New Q&A */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Add New Q&A Pair</h2>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Language
              </label>
              <select
                value={newQA.language}
                onChange={(e) => setNewQA({...newQA, language: e.target.value as 'de' | 'en'})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="de">German</option>
                <option value="en">English</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                value={newQA.category}
                onChange={(e) => setNewQA({...newQA, category: e.target.value})}
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Question
            </label>
            <input
              type="text"
              value={newQA.question}
              onChange={(e) => setNewQA({...newQA, question: e.target.value})}
              placeholder="e.g., Wann ist Check-in?"
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Answer
            </label>
            <textarea
              value={newQA.answer}
              onChange={(e) => setNewQA({...newQA, answer: e.target.value})}
              placeholder="e.g., Der Check-in ist von 15:00 bis 20:00 Uhr..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            />
          </div>

          <button
            onClick={addQAPair}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            <Plus size={20} />
            Add Q&A Pair
          </button>
        </div>
      </div>

      {/* Existing Q&A Pairs */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Training Data ({qaPairs.length} pairs)</h2>
          <button
            onClick={saveQAPairs}
            disabled={isLoading}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            <Save size={20} />
            Save All Changes
          </button>
        </div>

        {qaPairs.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No training data yet. Add some Q&A pairs above.
          </p>
        ) : (
          <div className="space-y-3">
            {qaPairs.map(qa => (
              <div key={qa.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 text-xs rounded ${
                        qa.language === 'de' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                      }`}>
                        {qa.language === 'de' ? 'DE' : 'EN'}
                      </span>
                      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {qa.category}
                      </span>
                      <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-700 rounded">
                        {(qa.confidence * 100).toFixed(0)}% confidence
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        <User size={16} className="text-gray-500 mt-0.5" />
                        <p className="text-sm font-medium text-gray-900">{qa.question}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <Bot size={16} className="text-blue-500 mt-0.5" />
                        <p className="text-sm text-gray-600">{qa.answer}</p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteQAPair(qa.id)}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Test Chat Bot */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">Test Chat Bot</h2>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={testQuestion}
              onChange={(e) => setTestQuestion(e.target.value)}
              placeholder="Ask a test question..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2"
            />
            <button
              onClick={testChatBot}
              disabled={isLoading || !testQuestion}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              Test
            </button>
          </div>

          {testResponse && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-700">{testResponse}</p>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">How Training Works</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Add question-answer pairs in both German and English</li>
          <li>• The chat bot will learn from these examples to improve its responses</li>
          <li>• Higher confidence pairs will be preferred when similar questions are asked</li>
          <li>• The bot automatically learns from admin corrections during live chats</li>
          <li>• Test your training data using the test section above</li>
        </ul>
      </div>
    </div>
  )
}
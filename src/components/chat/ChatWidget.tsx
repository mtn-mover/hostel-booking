'use client'

import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, User, Bot, RefreshCw, MessageSquare } from 'lucide-react'

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  
  // Make the chat widget globally accessible
  useEffect(() => {
    (window as any).openChatWidget = () => setIsOpen(true);
  }, [])
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: 'Hallo! Ich bin Ihr KI-Assistent für Heart of Interlaken Apartments. Wie kann ich Ihnen helfen? 😊',
      timestamp: new Date(),
      language: 'de'
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [language, setLanguage] = useState('de')
  const [unreadCount, setUnreadCount] = useState(0)
  const [showEscalation, setShowEscalation] = useState(false)
  const [sessionId, setSessionId] = useState('')
  
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  
  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Load chat history from localStorage on mount and generate session ID
  useEffect(() => {
    // Generate or retrieve session ID
    let storedSessionId = localStorage.getItem('heartInterlaken_sessionId')
    if (!storedSessionId) {
      storedSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      localStorage.setItem('heartInterlaken_sessionId', storedSessionId)
    }
    setSessionId(storedSessionId)
    
    const savedMessages = localStorage.getItem('heartInterlaken_chatHistory')
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages)
        setMessages(parsed)
      } catch (error) {
        console.error('Error loading chat history:', error)
      }
    }
  }, [])
  
  // Save chat history to localStorage
  useEffect(() => {
    if (messages.length > 1) { // Don't save just the welcome message
      localStorage.setItem('heartInterlaken_chatHistory', JSON.stringify(messages))
    }
  }, [messages])
  
  // Handle opening chat
  const handleOpen = () => {
    setIsOpen(true)
    setUnreadCount(0)
    
    // Focus input when opening
    setTimeout(() => {
      inputRef.current?.focus()
    }, 100)
  }
  
  // Handle closing chat
  const handleClose = () => {
    setIsOpen(false)
  }
  
  // Send message to backend
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return
    
    const userMessage = {
      id: messages.length + 1,
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
      language: language
    }
    
    // Add user message immediately
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)
    
    try {
      // Prepare chat history for API (last 10 messages to avoid token limits)
      const chatHistory = messages.slice(-10).map(msg => ({
        role: msg.role,
        content: msg.content
      }))
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputMessage,
          sessionId: sessionId,
          chatHistory: chatHistory,
          language: language
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || 'Chat service temporarily unavailable')
      }
      
      // Add assistant response
      const assistantMessage = {
        id: messages.length + 2,
        role: 'assistant', 
        content: data.response,
        timestamp: new Date(),
        language: data.language || language,
        isQuickResponse: data.isQuickResponse || false
      }
      
      setMessages(prev => [...prev, assistantMessage])
      
      // Update language if detected
      if (data.language && data.language !== language) {
        setLanguage(data.language)
      }
      
      // If chat is closed, increment unread counter
      if (!isOpen) {
        setUnreadCount(prev => prev + 1)
      }
      
    } catch (error) {
      console.error('Chat error:', error)
      
      // Add error message
      const errorMessage = {
        id: messages.length + 2,
        role: 'assistant',
        content: language === 'de' 
          ? 'Entschuldigung, ich hatte ein technisches Problem. Bitte versuchen Sie es erneut oder kontaktieren Sie unseren Support: +41 79 123 45 67'
          : 'Sorry, I had a technical issue. Please try again or contact our support: +41 79 123 45 67',
        timestamp: new Date(),
        language: language,
        isError: true
      }
      
      setMessages(prev => [...prev, errorMessage])
      setShowEscalation(true)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }
  
  // Clear chat history
  const clearChat = () => {
    setMessages([
      {
        id: 1,
        role: 'assistant',
        content: language === 'de' 
          ? 'Chat wurde zurückgesetzt. Hallo! Wie kann ich Ihnen helfen? 😊'
          : 'Chat has been reset. Hello! How can I help you? 😊',
        timestamp: new Date(),
        language: language
      }
    ])
    localStorage.removeItem('heartInterlaken_chatHistory')
  }
  
  // Escalate to WhatsApp support
  const escalateToHuman = () => {
    // Open WhatsApp in new window
    window.open('https://wa.me/41798016570', '_blank')
    
    const escalationMessage = {
      id: messages.length + 1,
      role: 'assistant',
      content: language === 'de'
        ? 'Ich habe WhatsApp für Sie geöffnet! Sie können uns direkt über WhatsApp kontaktieren: +41 79 801 65 70. Unser Team ist für Sie da!'
        : 'I\'ve opened WhatsApp for you! You can contact us directly via WhatsApp: +41 79 801 65 70. Our team is here to help!',
      timestamp: new Date(),
      language: language,
      isEscalation: true
    }
    
    setMessages(prev => [...prev, escalationMessage])
    setShowEscalation(false)
  }
  
  // Format timestamp
  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }
  
  return (
    <>
      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[32rem] bg-white rounded-lg shadow-2xl border border-gray-200 flex flex-col">
          {/* Header */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Heart Interlaken Support</h3>
                <p className="text-xs text-blue-100">KI-Assistent • Online</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Language Toggle */}
              <button
                onClick={() => setLanguage(language === 'de' ? 'en' : 'de')}
                className="text-xs bg-blue-500 hover:bg-blue-400 px-2 py-1 rounded transition-colors"
                title={language === 'de' ? 'Switch to English' : 'Auf Deutsch wechseln'}
              >
                {language === 'de' ? 'EN' : 'DE'}
              </button>
              
              {/* Clear Chat */}
              <button
                onClick={clearChat}
                className="text-blue-100 hover:text-white transition-colors"
                title={language === 'de' ? 'Chat löschen' : 'Clear chat'}
              >
                <RefreshCw size={16} />
              </button>
              
              {/* Close */}
              <button
                onClick={handleClose}
                className="text-blue-100 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message: any) => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  message.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : message.isError 
                      ? 'bg-red-100 text-red-600'
                      : message.isEscalation
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-200 text-gray-600'
                }`}>
                  {message.role === 'user' ? <User size={16} /> : 
                   message.isEscalation ? <MessageSquare size={16} /> : <Bot size={16} />}
                </div>
                
                {/* Message Bubble */}
                <div className={`max-w-[80%] ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                  <div className={`inline-block p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : message.isError
                        ? 'bg-red-50 text-red-800 border border-red-200'
                        : message.isEscalation
                          ? 'bg-green-50 text-green-800 border border-green-200'
                          : 'bg-white text-gray-800 border border-gray-200'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    {message.isQuickResponse && (
                      <span className="text-xs opacity-75 mt-1 block">
                        {language === 'de' ? '⚡ Schnellantwort' : '⚡ Quick response'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <Bot size={16} className="text-gray-600" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
          
          {/* Escalation Button */}
          {showEscalation && (
            <div className="px-4 py-2 bg-yellow-50 border-t border-yellow-200">
              <button
                onClick={escalateToHuman}
                className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors text-sm"
              >
                <MessageSquare size={16} />
                {language === 'de' ? 'WhatsApp Support' : 'WhatsApp Support'}
              </button>
            </div>
          )}
          
          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={language === 'de' ? 'Nachricht eingeben...' : 'Type a message...'}
                disabled={isLoading}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              />
              <button
                onClick={sendMessage}
                disabled={isLoading || !inputMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
            
            {/* Quick Action Buttons */}
            <div className="flex gap-2 mt-2 text-xs">
              <button
                onClick={() => setInputMessage(language === 'de' ? 'Wann ist Check-in?' : 'When is check-in?')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
              >
                {language === 'de' ? 'Check-in' : 'Check-in'}
              </button>
              <button
                onClick={() => setInputMessage(language === 'de' ? 'Wie ist das WLAN-Passwort?' : 'What is the WiFi password?')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
              >
                WiFi
              </button>
              <button
                onClick={() => setInputMessage(language === 'de' ? 'Wo kann ich parken?' : 'Where can I park?')}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 py-1 rounded transition-colors"
              >
                {language === 'de' ? 'Parkplatz' : 'Parking'}
              </button>
              <button
                onClick={escalateToHuman}
                className="bg-green-100 hover:bg-green-200 text-green-700 px-2 py-1 rounded transition-colors"
              >
                <MessageSquare size={12} className="inline mr-1" />
                WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
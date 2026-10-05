import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bot, 
  Send, 
  X, 
  Sparkles, 
  RotateCcw, 
  Calendar, 
  MapPin, 
  DollarSign, 
  Users, 
  ChevronRight, 
  CheckCircle2, 
  Compass, 
  Hotel, 
  Plane,
  Minimize2
} from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

// Helper to format simple markdown elements (bold, tables, lists, headers)
function renderFormattedMessage(text) {
  if (!text) return null

  // Check if text contains markdown tables (starts with | ... |)
  const lines = text.split('\n')
  const elements = []
  let tableBuffer = []
  let inTable = false

  const processInline = (str) => {
    // Bold **text**
    const parts = []
    let remaining = str
    let keyIdx = 0

    const boldRegex = /\*\*(.*?)\*\*/g
    let match
    let lastIndex = 0

    while ((match = boldRegex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index))
      }
      parts.push(
        <strong key={`b-${keyIdx++}`} className="font-semibold text-indigo-300">
          {match[1]}
        </strong>
      )
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex))
    }
    return parts.length > 0 ? parts : str
  }

  const flushTable = () => {
    if (tableBuffer.length < 2) {
      tableBuffer.forEach((l, idx) => {
        elements.push(<p key={`tbl-raw-${elements.length}-${idx}`} className="my-1">{processInline(l)}</p>)
      })
      tableBuffer = []
      inTable = false
      return
    }

    const headerLine = tableBuffer[0]
    const headerCells = headerLine
      .split('|')
      .map(c => c.trim())
      .filter((c, idx, arr) => (idx > 0 && idx < arr.length - 1) || (arr.length === 2 && c.length > 0))

    const bodyLines = tableBuffer.slice(2) // skip separator line

    elements.push(
      <div key={`table-${elements.length}`} className="my-3 overflow-x-auto rounded-lg border border-slate-700/60 bg-slate-900/60 shadow-inner">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/80 border-b border-slate-700 text-slate-300">
              {headerCells.map((hc, idx) => (
                <th key={`th-${idx}`} className="px-3 py-2 font-semibold">
                  {processInline(hc)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {bodyLines.map((row, rIdx) => {
              const cells = row
                .split('|')
                .map(c => c.trim())
                .filter((c, idx, arr) => (idx > 0 && idx < arr.length - 1) || (arr.length === 2 && c.length > 0))
              return (
                <tr key={`tr-${rIdx}`} className="hover:bg-slate-800/40 transition-colors">
                  {cells.map((cell, cIdx) => (
                    <td key={`td-${rIdx}-${cIdx}`} className="px-3 py-1.5 text-slate-300">
                      {processInline(cell)}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    )
    tableBuffer = []
    inTable = false
  }

  lines.forEach((line, idx) => {
    const trimmed = line.trim()
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      inTable = true
      tableBuffer.push(trimmed)
    } else {
      if (inTable) {
        flushTable()
      }
      if (trimmed.startsWith('### ')) {
        elements.push(
          <h4 key={`h-${idx}`} className="text-sm font-bold text-indigo-400 mt-2 mb-1">
            {processInline(trimmed.replace('### ', ''))}
          </h4>
        )
      } else if (trimmed.startsWith('## ')) {
        elements.push(
          <h3 key={`h-${idx}`} className="text-base font-bold text-indigo-300 mt-2.5 mb-1">
            {processInline(trimmed.replace('## ', ''))}
          </h3>
        )
      } else if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        elements.push(
          <li key={`li-${idx}`} className="ml-4 list-disc text-xs sm:text-sm text-slate-200 my-0.5">
            {processInline(trimmed.substring(2))}
          </li>
        )
      } else if (trimmed.length > 0) {
        elements.push(
          <p key={`p-${idx}`} className="text-xs sm:text-sm leading-relaxed text-slate-200 my-1">
            {processInline(trimmed)}
          </p>
        )
      } else {
        elements.push(<div key={`sp-${idx}`} className="h-1" />)
      }
    }
  })

  if (inTable) {
    flushTable()
  }

  return <div className="space-y-1">{elements}</div>
}

const QUICK_SUGGESTIONS = [
  { label: '🌴 5 days in Bali', prompt: 'Plan an unforgettable 5-day trip to Bali with top beaches and culture.' },
  { label: '🏨 Hotels in Paris', prompt: 'Recommend top romantic hotels in Paris near the Eiffel Tower.' },
  { label: '✈️ Budget Tokyo trip', prompt: 'How much budget do I need for a 7-day trip to Tokyo, and what places should I visit?' },
  { label: '📋 Book a vacation', prompt: 'I want to book a trip to the Maldives for 2 people next month.' },
]

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem('wanderlust_chat_messages')
      if (saved) return JSON.parse(saved)
    } catch {
      // ignore
    }
    return [
      {
        id: 'welcome',
        role: 'assistant',
        message: "👋 Hi there! I'm **TravelMate AI**, your personal Wanderlust travel concierge powered by Groq.\n\nAsk me about destination guides, personalized itineraries, or booking hotels and flights!",
        intent: 'general_chat',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
  })
  
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [hasUnread, setHasUnread] = useState(false)
  const [bookingProposal, setBookingProposal] = useState(null)
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Conversation session id
  const conversationId = useRef(() => {
    let id = localStorage.getItem('wanderlust_chat_conv_id')
    if (!id) {
      id = 'conv_' + Math.random().toString(36).substring(2, 10)
      localStorage.setItem('wanderlust_chat_conv_id', id)
    }
    return id
  }).current()

  useEffect(() => {
    try {
      localStorage.setItem('wanderlust_chat_messages', JSON.stringify(messages.slice(-30)))
    } catch {
      // ignore
    }
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen) {
      setHasUnread(false)
      setTimeout(() => inputRef.current?.focus(), 250)
      scrollToBottom()
    }
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSend = async (textToSend) => {
    const text = (textToSend || input).trim()
    if (!text || isLoading) return

    const userMessage = {
      id: 'msg_' + Date.now(),
      role: 'user',
      message: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const res = await api.post('/chat', {
        message: text,
        conversation_id: conversationId
      })

      const botReply = res.data?.reply || "I'm ready to assist with your next adventure! What destination do you have in mind?"
      const intent = res.data?.intent || 'general_chat'

      const botMessage = {
        id: 'msg_bot_' + Date.now(),
        role: 'assistant',
        message: botReply,
        intent: intent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }

      setMessages(prev => [...prev, botMessage])

      // If intent relates to booking, check if we can propose a 1-click booking card
      if (['booking', 'hotel_search', 'package_search'].includes(intent)) {
        detectBookingOpportunity(text, botReply)
      }

      if (!isOpen) {
        setHasUnread(true)
      }
    } catch (err) {
      console.error('Chat error:', err)
      toast.error('Unable to connect to AI server. Please try again.')
      setMessages(prev => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          role: 'assistant',
          message: "⚠️ I encountered a temporary connection issue. Please make sure the backend server is active and try again!",
          intent: 'error',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  // Parses response to offer quick booking card if user requested booking
  const detectBookingOpportunity = (userText, botReply) => {
    const lowerText = userText.toLowerCase()
    if (lowerText.includes('book') || lowerText.includes('reserve') || botReply.toLowerCase().includes('booking request')) {
      // Extract possible destination
      const destMatch = userText.match(/(?:to|in|for)\s+([A-Za-z\s]+?)(?:\s+(?:for|next|on|with|under)|$)/i)
      const destination = destMatch ? destMatch[1].trim() : 'Requested Destination'
      setBookingProposal({
        destination: destination,
        travelers: 2,
        bookingType: lowerText.includes('hotel') ? 'hotel' : lowerText.includes('flight') ? 'flight' : 'trip'
      })
    }
  }

  const handleConfirmQuickBooking = async () => {
    if (!bookingProposal) return
    setIsSubmittingBooking(true)
    try {
      const res = await api.post('/booking', {
        destination: bookingProposal.destination,
        travelers: bookingProposal.travelers,
        booking_type: bookingProposal.bookingType,
        conversation_id: conversationId,
        budget: '$1,500 - $3,000'
      })
      toast.success('🎉 Booking request submitted successfully!')
      setMessages(prev => [
        ...prev,
        {
          id: 'booking_confirm_' + Date.now(),
          role: 'assistant',
          message: `✅ **Booking Request Confirmed!**\n\nYour request for **${bookingProposal.destination}** has been registered (Ref: #${res.data?.booking?.booking_id || res.data?.booking_id || 'WNDR-99'}). Our travel concierge will reach out to verify flight & accommodation availability!`,
          intent: 'booking_confirmed',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ])
      setBookingProposal(null)
    } catch (err) {
      console.error(err)
      toast.error('Could not submit booking request.')
    } finally {
      setIsSubmittingBooking(false)
    }
  }

  const handleClearChat = () => {
    const reset = [
      {
        id: 'welcome_' + Date.now(),
        role: 'assistant',
        message: "✨ Chat cleared! Where would you like to explore next?",
        intent: 'general_chat',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]
    setMessages(reset)
    setBookingProposal(null)
    localStorage.removeItem('wanderlust_chat_messages')
    toast.success('Chat history cleared')
  }

  return (
    <>
      {/* Floating Action Button (FAB) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="mb-2 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-indigo-500/30 text-indigo-300 text-xs font-medium shadow-lg backdrop-blur-md cursor-pointer hover:border-indigo-400 transition-all"
              onClick={() => setIsOpen(true)}
            >
              <Sparkles size={14} className="text-amber-400 animate-pulse" />
              <span>Ask TravelMate AI</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          id="chatbot-toggle-button"
          onClick={() => setIsOpen(prev => !prev)}
          whileHover={{ scale: 1.06 }}
          whileTap={{ scale: 0.94 }}
          className="relative w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-2xl cursor-pointer border-none focus:outline-none"
          style={{
            background: 'var(--gradient-primary)',
            boxShadow: '0 8px 30px rgba(99, 102, 241, 0.45)'
          }}
          aria-label="Toggle Travel AI Chatbot"
        >
          {isOpen ? (
            <X size={26} className="text-white" />
          ) : (
            <div className="relative flex items-center justify-center">
              <Bot size={28} className="text-white" />
              {hasUnread && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-pink-500 rounded-full border-2 border-slate-900 animate-ping" />
              )}
            </div>
          )}

          {/* Ambient pulse ring */}
          {!isOpen && (
            <span className="absolute -inset-1 rounded-2xl bg-indigo-500/20 -z-10 animate-pulse pointer-events-none" />
          )}
        </motion.button>
      </div>

      {/* Chat Window Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="chatbot-window"
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] max-h-[82vh] h-[640px] flex flex-col rounded-2xl overflow-hidden glass border border-slate-700/80 shadow-2xl"
            style={{
              background: 'linear-gradient(180deg, rgba(15, 23, 42, 0.97) 0%, rgba(30, 41, 59, 0.95) 100%)',
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Header */}
            <div className="px-4 py-3.5 border-b border-slate-700/70 flex items-center justify-between bg-slate-900/60">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-md">
                  <Bot size={22} />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-slate-900" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white font-heading tracking-wide">
                      TravelMate <span className="text-indigo-400">AI</span>
                    </h3>
                    <span className="px-1.5 py-0.5 text-[10px] uppercase font-semibold tracking-wider rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Groq
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Online • Wanderlust AI Assistant
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-slate-400">
                <button
                  onClick={handleClearChat}
                  title="Clear conversation"
                  className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors bg-transparent border-none cursor-pointer"
                >
                  <RotateCcw size={16} />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  title="Minimize"
                  className="p-1.5 rounded-lg hover:text-white hover:bg-slate-800 transition-colors bg-transparent border-none cursor-pointer"
                >
                  <Minimize2 size={16} />
                </button>
              </div>
            </div>

            {/* Chat Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm scroll-smooth">
              {messages.map((msg) => {
                const isBot = msg.role === 'assistant'
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-end justify-end'}`}
                  >
                    {isBot && (
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-slate-800 text-indigo-400 border border-slate-700">
                        <Bot size={15} />
                      </div>
                    )}

                    <div className={`max-w-[85%] flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-md ${
                          isBot
                            ? 'bg-slate-800/90 text-slate-200 border border-slate-700/60 rounded-tl-sm'
                            : 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-sm'
                        }`}
                      >
                        {isBot ? (
                          renderFormattedMessage(msg.message)
                        ) : (
                          <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1 px-1">
                        {isBot && msg.intent && msg.intent !== 'general_chat' && (
                          <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                            {msg.intent.replace('_', ' ')}
                          </span>
                        )}
                        <span className="text-[10px] text-slate-500">{msg.timestamp}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}

              {/* Typing / Loading Indicator */}
              {isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2.5 items-start"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 bg-slate-800 text-indigo-400 border border-slate-700">
                    <Bot size={15} />
                  </div>
                  <div className="bg-slate-800/90 text-slate-300 border border-slate-700/60 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2 shadow-md">
                    <span className="text-xs text-indigo-300 font-medium">TravelMate is thinking</span>
                    <div className="flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Booking Proposal Card (Quick Submit) */}
              {bookingProposal && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-3.5 rounded-xl border border-indigo-500/40 bg-indigo-950/40 backdrop-blur-sm space-y-2.5 shadow-lg"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      Ready to reserve this trip?
                    </span>
                    <button
                      onClick={() => setBookingProposal(null)}
                      className="text-slate-400 hover:text-white text-xs bg-transparent border-none cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    <p className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-pink-400" />
                      <strong>Destination:</strong> {bookingProposal.destination}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Users size={13} className="text-indigo-400" />
                      <strong>Travelers:</strong> {bookingProposal.travelers} Guests
                    </p>
                    <p className="flex items-center gap-1.5">
                      <DollarSign size={13} className="text-emerald-400" />
                      <strong>Status:</strong> Instant Concierge Request
                    </p>
                  </div>
                  <button
                    onClick={handleConfirmQuickBooking}
                    disabled={isSubmittingBooking}
                    className="w-full py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-all shadow cursor-pointer border-none disabled:opacity-50"
                  >
                    {isSubmittingBooking ? 'Submitting...' : 'Confirm & Request Booking'}
                    <ChevronRight size={14} />
                  </button>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Action Suggestion Chips */}
            <div className="px-3 py-2 border-t border-slate-800 bg-slate-900/50 flex gap-2 overflow-x-auto no-scrollbar">
              {QUICK_SUGGESTIONS.map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s.prompt)}
                  disabled={isLoading}
                  className="whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800/80 hover:bg-indigo-600/30 text-slate-300 hover:text-white border border-slate-700/60 transition-all cursor-pointer shrink-0 disabled:opacity-40"
                >
                  {s.label}
                </button>
              ))}
            </div>

            {/* Input Form */}
            <div className="p-3 border-t border-slate-700/80 bg-slate-900/80">
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSend()
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask about destinations, flights, hotels..."
                  disabled={isLoading}
                  className="flex-1 bg-slate-800/90 text-white placeholder-slate-400 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white flex items-center justify-center shrink-0 hover:opacity-90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed border-none cursor-pointer shadow-md"
                  aria-label="Send message"
                >
                  <Send size={16} />
                </button>
              </form>
              <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500">
                <span>Fast AI replies powered by Groq</span>
                <span>Enter to send</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

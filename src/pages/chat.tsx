import { useRouter } from 'next/router'
import Head from 'next/head'
import { useState, useRef, useEffect } from 'react'
import { JOBS } from '@/data/jobs'
import { MENTORS } from '@/data/mentors'
import { INTENT_OPTIONS, Intent } from '@/types/intent'
import { POPULAR_QUESTIONS } from '@/data/popularQuestions'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

interface Message {
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
}

const INTENT_GREETINGS: Record<Intent, (mentorName: string, jobTitle: string) => string> = {
  jd: (name, job) => `안녕하세요! ${name}이에요.\n${job} 채용공고에 대해 궁금한 거 뭐든 물어보세요!`,
  story: (name, job) => `안녕! 나 ${name}이야.\n${job} 직무 실무 경험이나 커리어 얘기 편하게 물어봐!`,
  resume: (name, job) => `안녕하세요! ${name}이에요.\n${job} 지원 자소서, KT 합격 선배들 예시 기반으로 같이 다듬어볼게요!`,
}

export default function ChatPage() {
  const router = useRouter()
  const { jobId, mentorId, intent } = router.query

  const job = JOBS.find((j) => j.id === jobId)
  const mentor = MENTORS.find((m) => m.id === mentorId)
  const intentOption = INTENT_OPTIONS.find((i) => i.id === intent)
  const popularQuestions = POPULAR_QUESTIONS[(intent as Intent) ?? 'jd']

  const [sessionId] = useState(() => crypto.randomUUID())
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (mentor && job && intent) {
      const greeting = INTENT_GREETINGS[intent as Intent]?.(mentor.name, job.title)
      if (greeting) setMessages([{ role: 'assistant', content: greeting }])
    }
  }, [mentor?.id, job?.id, intent])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          mentor_id: mentorId,
          job_id: jobId ?? '',
          intent: intent ?? 'story',
          message: text,
        }),
      })
      const data = await res.json()
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.reply, suggestions: data.suggestions ?? [] },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: '서버 연결에 실패했습니다. 잠시 후 다시 시도해주세요.' },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  const hasUserMessage = messages.some((m) => m.role === 'user')

  if (!job || !mentor || !intentOption) {
    return (
      <div className="min-h-screen bg-kt-gray flex items-center justify-center">
        <p className="text-gray-400">잘못된 접근입니다.</p>
      </div>
    )
  }

  return (
    <>
      <Head>
        <title>{mentor.name}와 대화 · KT 채용 어드바이저</title>
      </Head>

      <div className="flex flex-col h-screen bg-kt-gray">
        {/* 헤더 */}
        <header className="bg-white border-b border-gray-200 flex-shrink-0">
          <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-gray-400 hover:text-gray-700 transition-colors text-sm"
            >
              ←
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                {mentor.emoji}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{mentor.name}</p>
                <p className="text-xs text-gray-400">{mentor.role}</p>
              </div>
            </div>
            <span className="text-xs bg-red-50 text-kt-red border border-red-100 px-3 py-1 rounded-full font-medium">
              {intentOption.emoji} {intentOption.label}
            </span>
          </div>
        </header>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto py-6">
          <div className="max-w-2xl mx-auto px-6 flex flex-col gap-4">

            {messages.map((msg, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
                  {msg.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base flex-shrink-0 mt-1">
                      {mentor.emoji}
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-kt-red text-white rounded-br-sm'
                        : 'bg-white text-gray-800 border border-gray-100 rounded-bl-sm'
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>

                {/* 후속 질문 추천 칩 */}
                {msg.role === 'assistant' && msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-2 ml-11">
                    {msg.suggestions.map((s, j) => (
                      <button
                        key={j}
                        onClick={() => sendMessage(s)}
                        disabled={loading}
                        className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-kt-red hover:text-kt-red transition-colors disabled:opacity-50"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* 로딩 */}
            {loading && (
              <div className="flex justify-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-base flex-shrink-0 mt-1">
                  {mentor.emoji}
                </div>
                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* 인기 질문 칩 - 첫 메시지 전에만 표시 */}
        {!hasUserMessage && popularQuestions && (
          <div className="bg-white border-t border-gray-100 flex-shrink-0">
            <div className="max-w-2xl mx-auto px-6 py-3">
              <p className="text-xs text-gray-400 mb-2">💬 자주 묻는 질문</p>
              <div className="flex flex-wrap gap-2">
                {popularQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-xs bg-gray-50 border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-kt-red hover:text-kt-red transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 입력창 */}
        <div className="bg-white border-t border-gray-200 flex-shrink-0">
          <div className="max-w-2xl mx-auto px-6 py-3 flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={`${intentOption.label}에 대해 물어보세요 (Enter로 전송)`}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-kt-red transition-colors max-h-32"
              style={{ overflowY: 'auto' }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                input.trim() && !loading
                  ? 'bg-kt-red text-white hover:bg-red-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

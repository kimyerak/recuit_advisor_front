import { useRouter } from 'next/router'
import Head from 'next/head'
import { useState, useRef, useEffect } from 'react'
import { JOBS } from '@/data/jobs'
import { MENTORS } from '@/data/mentors'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const router = useRouter()
  const { jobId, mentorId } = router.query

  const job = JOBS.find((j) => j.id === jobId)
  const mentor = MENTORS.find((m) => m.id === mentorId)

  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // 멘토 첫 인사
  useEffect(() => {
    if (mentor && job) {
      setMessages([
        {
          role: 'assistant',
          content: `안녕하세요! 저는 ${mentor.name}이에요 😊\n${job.title} [${job.type}] 채용에 대해 궁금한 거 뭐든 물어보세요!`,
        },
      ])
    }
  }, [mentor?.id, job?.id])

  const handleSend = async () => {
    const text = input.trim()
    if (!text || loading) return

    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setLoading(true)

    // TODO: 실제 API 연결
    await new Promise((r) => setTimeout(r, 800))
    setMessages((prev) => [...prev, { role: 'assistant', content: '응답없음' }])
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!job || !mentor) {
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

            {/* 멘토 정보 */}
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                {mentor.emoji}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{mentor.name}</p>
                <p className="text-xs text-gray-400">{mentor.role}</p>
              </div>
            </div>

            {/* 채용공고 배지 */}
            <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
              {job.title} [{job.type}]
            </span>
          </div>
        </header>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto py-6">
          <div className="max-w-2xl mx-auto px-6 flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}
              >
                {/* 멘토 아바타 */}
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

        {/* 입력창 */}
        <div className="bg-white border-t border-gray-200 flex-shrink-0">
          <div className="max-w-2xl mx-auto px-6 py-3 flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="궁금한 거 물어보세요 (Enter로 전송)"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-kt-red transition-colors max-h-32"
              style={{ overflowY: 'auto' }}
            />
            <button
              onClick={handleSend}
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

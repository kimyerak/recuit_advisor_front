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
  isIntentSelect?: boolean   // 첫 인트로 메시지 여부
}

const INTRO_MESSAGES: Record<string, (name: string, job: string) => string> = {
  kim_taeuk: (name, job) =>
    `안녕! 나 ${name}이야 😄\n${job} 직무 지원하는 거지?\n\n오늘 뭐가 궁금해?\n\n1️⃣  채용공고 내용이 궁금해요\n2️⃣  선배 실무 얘기 듣고 싶어요\n3️⃣  자소서 같이 봐주세요`,
  song_junho: (name, job) =>
    `안녕하세요! ${name}이에요 😊\n${job} 지원을 준비 중이시군요!\n\n어떤 부분을 도와드릴까요?\n\n1️⃣  채용공고 내용이 궁금해요\n2️⃣  선배 커리어 얘기 듣고 싶어요\n3️⃣  자소서 같이 봐주세요`,
  kim_yerak: (name, job) =>
    `안녕하세요~ ${name}이에요! 🚀\n${job} 지원 준비 중이시죠?\n\n오늘 어떤 도움이 필요하세요?\n\n1️⃣  채용공고 내용이 궁금해요\n2️⃣  선배 이야기 듣고 싶어요\n3️⃣  자소서 같이 봐주세요`,
}

const INTENT_REPLIES: Record<Intent, (name: string) => string> = {
  jd: (name) => `채용공고 관련 질문이군요!\n${name}이 꼼꼼하게 알려드릴게요. 궁금한 거 뭐든 물어보세요 😊`,
  story: (name) => `실무 이야기 궁금하구나!\n${name}의 경험 솔직하게 얘기해줄게. 편하게 물어봐!`,
  resume: (name) => `자소서 같이 봐드릴게요!\n${name}이 KT 합격 전략 기반으로 조언해드릴게요. 어떤 항목부터 시작할까요?`,
}

export default function ChatPage() {
  const router = useRouter()
  const { jobId, mentorId } = router.query

  const job = JOBS.find((j) => j.id === jobId)
  const mentor = MENTORS.find((m) => m.id === mentorId)

  const [sessionId] = useState(() => crypto.randomUUID())
  const [intent, setIntent] = useState<Intent | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // 첫 인트로 메시지
  useEffect(() => {
    if (mentor && job) {
      const introFn = INTRO_MESSAGES[mentor.id] ?? INTRO_MESSAGES['song_junho']
      setMessages([{
        role: 'assistant',
        content: introFn(mentor.name, job.title),
        isIntentSelect: true,
      }])
    }
  }, [mentor?.id, job?.id])

  // intent 선택 처리
  const handleSelectIntent = (selected: Intent) => {
    const option = INTENT_OPTIONS.find((o) => o.id === selected)!
    const replyFn = INTENT_REPLIES[selected]

    setIntent(selected)
    setMessages((prev) => [
      ...prev.map((m) => ({ ...m, isIntentSelect: false })), // 버튼 숨기기
      { role: 'user', content: `${option.emoji} ${option.label}` },
      { role: 'assistant', content: replyFn(mentor!.name) },
    ])
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading || !intent) return

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
          intent,
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

  const popularQuestions = intent ? POPULAR_QUESTIONS[intent] : []
  const hasUserMessage = messages.some((m) => m.role === 'user')

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
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-xl">
                {mentor.emoji}
              </div>
              <div>
                <p className="font-bold text-gray-900 text-sm">{mentor.name}</p>
                <p className="text-xs text-gray-400">{mentor.role}</p>
              </div>
            </div>
            {intent && (
              <span className="text-xs bg-red-50 text-kt-red border border-red-100 px-3 py-1 rounded-full font-medium">
                {INTENT_OPTIONS.find((o) => o.id === intent)?.emoji}{' '}
                {INTENT_OPTIONS.find((o) => o.id === intent)?.label}
              </span>
            )}
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

                {/* intent 선택 버튼 */}
                {msg.isIntentSelect && (
                  <div className="flex flex-col gap-2 ml-11">
                    {INTENT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleSelectIntent(option.id)}
                        className="flex items-center gap-3 px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl text-left hover:border-kt-red hover:bg-red-50 transition-all"
                      >
                        <span className="text-xl">{option.emoji}</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{option.label}</p>
                          <p className="text-xs text-gray-400">{option.description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {/* 후속 질문 추천 칩 */}
                {msg.role === 'assistant' && !msg.isIntentSelect && msg.suggestions && msg.suggestions.length > 0 && (
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

        {/* 인기 질문 칩 - intent 선택 후 & 첫 질문 전에만 */}
        {intent && !hasUserMessage && popularQuestions.length > 0 && (
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

        {/* 입력창 - intent 선택 후에만 활성화 */}
        <div className="bg-white border-t border-gray-200 flex-shrink-0">
          <div className="max-w-2xl mx-auto px-6 py-3 flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={intent ? '궁금한 거 물어보세요 (Enter로 전송)' : '위에서 주제를 먼저 선택해주세요'}
              disabled={!intent}
              rows={1}
              className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-kt-red transition-colors max-h-32 disabled:bg-gray-50 disabled:text-gray-400"
              style={{ overflowY: 'auto' }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading || !intent}
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                input.trim() && !loading && intent
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

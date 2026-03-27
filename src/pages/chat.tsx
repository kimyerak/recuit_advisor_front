import { useRouter } from 'next/router'
import Head from 'next/head'
import { useState, useRef, useEffect } from 'react'
import { JOBS } from '@/data/jobs'
import { MENTORS } from '@/data/mentors'
import { POPULAR_QUESTIONS } from '@/data/popularQuestions'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

interface Message {
  role: 'user' | 'assistant'
  content: string
  suggestions?: string[]
}

const INTRO_MESSAGES: Record<string, (job: string) => string> = {
  vic: (job) =>
    `안녕! 나 빅이야 🟠\n${job} 직무 준비하러 왔구나!\n\n핵심만 바로 말해줄게. 뭐든 물어봐!`,
  ddory: (job) =>
    `안녕~ 나는 또리야 🔵\n${job} 직무가 궁금한 거야?\n\n같이 하나씩 알아보자! 뭐부터 궁금해? 😊`,
}

export default function ChatPage() {
  const router = useRouter()
  const { jobId, mentorId } = router.query

  const job = JOBS.find((j) => j.id === jobId)
  const mentor = MENTORS.find((m) => m.id === mentorId)

  const [sessionId] = useState(() => crypto.randomUUID())
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showSurvey, setShowSurvey] = useState(false)
  const [surveyDone, setSurveyDone] = useState(false)
  const [satisfaction, setSatisfaction] = useState(0)
  const [applied, setApplied] = useState<'yes' | 'no' | 'considering' | null>(null)
  const [helpfulAspects, setHelpfulAspects] = useState<string[]>([])
  const [freeText, setFreeText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const toggleAspect = (aspect: string) => {
    setHelpfulAspects((prev) =>
      prev.includes(aspect) ? prev.filter((a) => a !== aspect) : [...prev, aspect]
    )
  }

  const handleSurveySubmit = () => {
    setSurveyDone(true)
    const audio = new Audio(`${API_URL}/static/임창정 MV 16집 '소확행'.mp3`)
    audio.play().catch(() => {})
    setTimeout(() => router.push('/'), 15000)
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  // 인트로 메시지
  useEffect(() => {
    if (mentor && job) {
      const introFn = INTRO_MESSAGES[mentor.id] ?? INTRO_MESSAGES['ddory']
      setMessages([{ role: 'assistant', content: introFn(job.title) }])
    }
  }, [mentor?.id, job?.id])

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

  if (!job || !mentor) {
    return (
      <div className="min-h-screen bg-kt-gray flex items-center justify-center">
        <p className="text-gray-400">잘못된 접근입니다.</p>
      </div>
    )
  }

  const avatarBg = mentor.color === 'orange' ? 'bg-orange-900/40' : 'bg-blue-900/40'

  return (
    <>
      <Head>
        <title>{mentor.name}와 대화 · KT 채용 어드바이저</title>
      </Head>

      <div className="flex flex-col h-screen bg-kt-bg">
        {/* 헤더 */}
        <header className="bg-kt-surface border-b border-kt-border flex-shrink-0">
          <div className="max-w-2xl mx-auto px-6 py-3 flex items-center gap-3">
            <button
              onClick={() => router.back()}
              className="text-gray-500 hover:text-white transition-colors text-sm"
            >
              ← 목록
            </button>
            <div className="flex items-center gap-3 flex-1">
              <div className={`w-10 h-10 rounded-full ${avatarBg} flex items-center justify-center overflow-hidden flex-shrink-0`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={mentor.image} alt={mentor.name} className="w-full h-full object-contain" />
              </div>
              <div>
                <p className="font-bold text-white text-sm">{mentor.name}</p>
                <p className="text-xs text-kt-muted">{mentor.role}</p>
              </div>
            </div>
            <button
              onClick={() => setShowSurvey(true)}
              className="text-xs text-gray-400 border border-kt-border px-3 py-1.5 rounded-lg hover:border-kt-red hover:text-kt-red transition-colors flex-shrink-0"
            >
              상담종료
            </button>
          </div>
        </header>

        {/* 메시지 목록 */}
        <div className="flex-1 overflow-y-auto py-6">
          <div className="max-w-2xl mx-auto px-6 flex flex-col gap-4">
            {messages.map((msg, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-3`}>
                  {msg.role === 'assistant' && (
                    <div className={`w-8 h-8 rounded-full ${avatarBg} flex items-center justify-center overflow-hidden flex-shrink-0 mt-1`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mentor.image} alt={mentor.name} className="w-full h-full object-contain" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-kt-red text-white rounded-br-sm'
                        : 'bg-kt-surface text-gray-100 border border-kt-border rounded-bl-sm'
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
                        className="text-xs bg-kt-bg border border-kt-border text-gray-400 px-3 py-1.5 rounded-full hover:border-kt-red hover:text-kt-red transition-colors disabled:opacity-50"
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
                <div className={`w-8 h-8 rounded-full ${avatarBg} flex items-center justify-center overflow-hidden flex-shrink-0 mt-1`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={mentor.image} alt={mentor.name} className="w-full h-full object-contain" />
                </div>
                <div className="bg-kt-surface border border-kt-border px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                  <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:0ms]" />
                  <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:150ms]" />
                  <span className="w-2 h-2 bg-gray-600 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        </div>

        {/* 자주 묻는 질문 - 첫 질문 전에만 */}
        {!hasUserMessage && (
          <div className="bg-kt-surface border-t border-kt-border flex-shrink-0">
            <div className="max-w-2xl mx-auto px-6 py-3">
              <p className="text-xs text-kt-muted mb-2">💬 자주 묻는 질문</p>
              <div className="flex flex-wrap gap-2">
                {POPULAR_QUESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-xs bg-kt-bg border border-kt-border text-gray-400 px-3 py-1.5 rounded-full hover:border-kt-red hover:text-kt-red transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 입력창 */}
        <div className="bg-kt-surface border-t border-kt-border flex-shrink-0">
          <div className="max-w-2xl mx-auto px-6 py-3 flex gap-3 items-end">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="궁금한 거 물어보세요 (Enter로 전송)"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-kt-border bg-kt-bg text-white placeholder-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-kt-red transition-colors max-h-32"
              style={{ overflowY: 'auto' }}
            />
            <button
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
              className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                input.trim() && !loading
                  ? 'bg-kt-red text-white hover:bg-red-700'
                  : 'bg-kt-bg border border-kt-border text-gray-600 cursor-not-allowed'
              }`}
            >
              <svg className="w-4 h-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 만족도 조사 모달 */}
      {showSurvey && (
        <div className="fixed inset-0 bg-black/60 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-kt-surface border border-kt-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {surveyDone ? (
              <div className="flex flex-col items-center justify-center py-12 px-8 text-center">
                <div className="animate-pop-in">
                  <div className={`w-36 h-36 rounded-full ${avatarBg} flex items-center justify-center overflow-hidden mb-6 animate-float`}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={mentor.image} alt={mentor.name} className="w-full h-full object-contain" />
                  </div>
                </div>
                <p className="text-white font-bold text-xl mb-2">응답해주셔서 감사해요!</p>
                <p className="text-kt-muted text-sm">{mentor.name}이(가) 응원할게요 🎉</p>
                <div className="mt-5 bg-kt-bg border border-kt-border rounded-xl px-5 py-4 text-center">
                  <p className="text-kt-red font-bold text-sm mb-1">🎵 KT 퇴근송 — 소확행</p>
                  <p className="text-gray-400 text-xs leading-relaxed">
                    이 노래는 실제 KT 직원들이 퇴근할 때 듣는 퇴근송이야!<br />
                    오늘 하루도 수고했어. 곧 너도 이 노래 들으며 퇴근하는 날이 올 거야 😊
                  </p>
                </div>
                <p className="text-kt-muted text-xs mt-4">잠시 후 메인 화면으로 이동합니다</p>
              </div>
            ) : (
              <div className="p-6 flex flex-col gap-6">
                <div>
                  <p className="text-white font-bold text-base">상담은 어떠셨나요?</p>
                  <p className="text-kt-muted text-xs mt-1">솔직한 답변이 큰 도움이 됩니다</p>
                </div>

                {/* 만족도 */}
                <div>
                  <p className="text-sm text-gray-300 font-medium mb-3">전반적인 만족도</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        onClick={() => setSatisfaction(n)}
                        className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                          satisfaction >= n
                            ? 'bg-kt-red text-white'
                            : 'bg-kt-bg border border-kt-border text-gray-500 hover:border-kt-red'
                        }`}
                      >
                        {['😞', '😐', '🙂', '😊', '🤩'][n - 1]}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between mt-1.5 px-1">
                    <span className="text-xs text-kt-muted">별로였어요</span>
                    <span className="text-xs text-kt-muted">최고였어요</span>
                  </div>
                </div>

                {/* 실제 지원 여부 */}
                <div>
                  <p className="text-sm text-gray-300 font-medium mb-3">이 직무에 실제로 지원할 생각이 있으신가요?</p>
                  <div className="flex flex-col gap-2">
                    {[
                      { value: 'yes', label: '네, 지원할 예정이에요' },
                      { value: 'considering', label: '아직 고민 중이에요' },
                      { value: 'no', label: '아니요, 다른 직무를 볼게요' },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        onClick={() => setApplied(value as 'yes' | 'no' | 'considering')}
                        className={`text-left px-4 py-3 rounded-xl text-sm border transition-all ${
                          applied === value
                            ? 'border-kt-red bg-kt-red/10 text-white'
                            : 'border-kt-border bg-kt-bg text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 도움이 됐던 부분 */}
                <div>
                  <p className="text-sm text-gray-300 font-medium mb-3">어떤 부분이 도움이 됐나요? <span className="text-kt-muted font-normal">(복수 선택)</span></p>
                  <div className="flex flex-wrap gap-2">
                    {['직무 이해', '자기소개서 팁', '면접 준비', '연봉/처우', '사내 문화', '커리어 패스'].map((aspect) => (
                      <button
                        key={aspect}
                        onClick={() => toggleAspect(aspect)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                          helpfulAspects.includes(aspect)
                            ? 'border-kt-red bg-kt-red/10 text-kt-red'
                            : 'border-kt-border bg-kt-bg text-gray-400 hover:border-gray-500'
                        }`}
                      >
                        {aspect}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 자유 의견 */}
                <div>
                  <p className="text-sm text-gray-300 font-medium mb-2">추가로 하고 싶은 말이 있나요? <span className="text-kt-muted font-normal">(선택)</span></p>
                  <textarea
                    value={freeText}
                    onChange={(e) => setFreeText(e.target.value)}
                    placeholder="자유롭게 남겨주세요"
                    rows={3}
                    className="w-full resize-none rounded-xl border border-kt-border bg-kt-bg text-white placeholder-gray-600 px-4 py-3 text-sm focus:outline-none focus:border-kt-red transition-colors"
                  />
                </div>

                {/* 버튼 */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowSurvey(false)}
                    className="flex-1 py-3 rounded-xl border border-kt-border text-gray-400 text-sm hover:border-gray-500 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleSurveySubmit}
                    disabled={satisfaction === 0 || applied === null}
                    className={`flex-2 flex-grow py-3 rounded-xl text-sm font-bold transition-all ${
                      satisfaction > 0 && applied !== null
                        ? 'bg-kt-red text-white hover:bg-red-700'
                        : 'bg-kt-bg border border-kt-border text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    제출하기
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

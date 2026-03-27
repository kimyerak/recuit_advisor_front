import { useRouter } from 'next/router'
import Head from 'next/head'
import { useState } from 'react'
import { JOBS } from '@/data/jobs'
import { MENTORS } from '@/data/mentors'
import { INTENT_OPTIONS, Intent } from '@/types/intent'
import MentorCard from '@/components/MentorCard'

export default function JobDetailPage() {
  const router = useRouter()
  const { jobId } = router.query

  const job = JOBS.find((j) => j.id === jobId)
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null)
  const [selectedIntent, setSelectedIntent] = useState<Intent | null>(null)

  if (!job) {
    return (
      <div className="min-h-screen bg-kt-gray flex items-center justify-center">
        <p className="text-gray-400">채용공고를 찾을 수 없습니다.</p>
      </div>
    )
  }

  const canStart = selectedMentor && selectedIntent

  const handleStart = () => {
    if (!canStart) return
    router.push(`/chat?jobId=${job.id}&mentorId=${selectedMentor}&intent=${selectedIntent}`)
  }

  return (
    <>
      <Head>
        <title>{job.title} [{job.type}] · KT 채용 어드바이저</title>
      </Head>

      <div className="min-h-screen bg-kt-gray">
        {/* 헤더 */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-3">
            <button
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-gray-700 transition-colors"
            >
              ← 목록
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-kt-red rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">KT</span>
              </div>
              <span className="font-bold text-gray-900 text-sm">KT 채용 어드바이저</span>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-6 py-10">
          {/* 채용공고 배지 */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                {job.type}
              </span>
              <span className="text-xs text-gray-400">{job.department}</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
            <div className="flex flex-wrap gap-1 mt-3">
              {job.tags.map((tag) => (
                <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-md">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* STEP 1 - 멘토 선택 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-kt-red text-white text-xs font-bold flex items-center justify-center">1</span>
              <h2 className="text-lg font-bold text-gray-900">어떤 선배를 고르시겠어요?</h2>
            </div>
            <p className="text-sm text-gray-400 mb-4 ml-8">선배마다 조언 스타일이 달라요</p>

            <div className="grid grid-cols-3 gap-3">
              {MENTORS.map((mentor) => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                  selected={selectedMentor === mentor.id}
                  onSelect={setSelectedMentor}
                />
              ))}
            </div>
          </div>

          {/* STEP 2 - 질문 유형 선택 */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-6 h-6 rounded-full bg-kt-red text-white text-xs font-bold flex items-center justify-center">2</span>
              <h2 className="text-lg font-bold text-gray-900">무엇이 궁금하세요?</h2>
            </div>
            <p className="text-sm text-gray-400 mb-4 ml-8">유형에 따라 다른 방식으로 답해드려요</p>

            <div className="flex flex-col gap-2">
              {INTENT_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setSelectedIntent(option.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 ${
                    selectedIntent === option.id
                      ? 'border-kt-red bg-red-50'
                      : 'border-gray-200 bg-white hover:border-kt-red'
                  }`}
                >
                  <span className="text-3xl">{option.emoji}</span>
                  <div>
                    <p className={`font-bold text-sm ${selectedIntent === option.id ? 'text-kt-red' : 'text-gray-900'}`}>
                      {option.label}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{option.description}</p>
                  </div>
                  {selectedIntent === option.id && (
                    <div className="ml-auto w-5 h-5 rounded-full bg-kt-red flex items-center justify-center flex-shrink-0">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* 시작 버튼 */}
          <button
            onClick={handleStart}
            disabled={!canStart}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 ${
              canStart
                ? 'bg-kt-red text-white hover:bg-red-700 shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {canStart
              ? `${MENTORS.find((m) => m.id === selectedMentor)?.name}에게 물어보기 →`
              : '선배와 질문 유형을 선택해주세요'}
          </button>
        </main>
      </div>
    </>
  )
}

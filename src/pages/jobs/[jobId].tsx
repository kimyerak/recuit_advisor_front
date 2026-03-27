import { useRouter } from 'next/router'
import Head from 'next/head'
import { useState } from 'react'
import { JOBS } from '@/data/jobs'
import { MENTORS } from '@/data/mentors'
import MentorCard from '@/components/MentorCard'

export default function JobDetailPage() {
  const router = useRouter()
  const { jobId } = router.query

  const job = JOBS.find((j) => j.id === jobId)
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null)

  if (!job) {
    return (
      <div className="min-h-screen bg-kt-gray flex items-center justify-center">
        <p className="text-gray-400">채용공고를 찾을 수 없습니다.</p>
      </div>
    )
  }

  const handleStart = () => {
    if (!selectedMentor) return
    router.push(`/chat?jobId=${job.id}&mentorId=${selectedMentor}`)
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

          {/* 멘토 선택 */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-1">어떤 선배를 고르시겠어요?</h2>
            <p className="text-sm text-gray-400 mb-5">
              선배마다 조언 스타일이 달라요. 원하는 방향에 맞게 골라보세요.
            </p>

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

          {/* 시작 버튼 */}
          <button
            onClick={handleStart}
            disabled={!selectedMentor}
            className={`w-full py-4 rounded-2xl font-bold text-base transition-all duration-200 ${
              selectedMentor
                ? 'bg-kt-red text-white hover:bg-red-700 shadow-md'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {selectedMentor
              ? `${MENTORS.find((m) => m.id === selectedMentor)?.name}에게 물어보기 →`
              : '선배를 선택해주세요'}
          </button>
        </main>
      </div>
    </>
  )
}

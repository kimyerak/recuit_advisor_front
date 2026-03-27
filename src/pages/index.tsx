import Head from 'next/head'
import JobCard from '@/components/JobCard'
import { JOBS } from '@/data/jobs'
import { JobType } from '@/types/job'
import { useState } from 'react'

const FILTERS: (JobType | '전체')[] = ['전체', '신입채용', '경력채용', '인턴']

export default function Home() {
  const [filter, setFilter] = useState<JobType | '전체'>('전체')

  const filtered = filter === '전체' ? JOBS : JOBS.filter((j) => j.type === filter)

  return (
    <>
      <Head>
        <title>KT 채용 어드바이저</title>
        <meta name="description" content="KT 선배에게 채용공고 기반 맞춤 조언을 받아보세요" />
      </Head>

      <div className="min-h-screen bg-kt-gray">
        {/* 헤더 */}
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center gap-3">
            <div className="w-8 h-8 bg-kt-red rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">KT</span>
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900">KT 채용 어드바이저</h1>
              <p className="text-xs text-gray-500">선배에게 채용공고 기반 맞춤 조언을 받아보세요</p>
            </div>
          </div>
        </header>

        {/* 메인 */}
        <main className="max-w-5xl mx-auto px-6 py-10">
          {/* 히어로 */}
          <div className="mb-10 text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              어떤 직무에 지원하시나요?
            </h2>
            <p className="text-gray-500">
              채용공고를 선택하면 실제 KT 선배가 맞춤 조언을 드려요
            </p>
          </div>

          {/* 필터 */}
          <div className="flex gap-2 mb-6">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-kt-red text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:border-kt-red'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* 채용공고 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center text-gray-400 py-20">해당 유형의 채용공고가 없습니다.</p>
          )}
        </main>
      </div>
    </>
  )
}

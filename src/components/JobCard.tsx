import { Job } from '@/types/job'
import { useRouter } from 'next/router'

const TYPE_COLORS: Record<string, string> = {
  '신입채용': 'bg-blue-100 text-blue-700',
  '경력채용': 'bg-purple-100 text-purple-700',
  '인턴': 'bg-green-100 text-green-700',
}

interface Props {
  job: Job
}

export default function JobCard({ job }: Props) {
  const router = useRouter()

  return (
    <div
      onClick={() => router.push(`/jobs/${job.id}`)}
      className="bg-white rounded-2xl border border-gray-200 p-6 cursor-pointer hover:shadow-lg hover:border-kt-red transition-all duration-200 group"
    >
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${TYPE_COLORS[job.type]}`}>
            {job.type}
          </span>
          <p className="text-xs text-gray-400 mt-1">{job.department}</p>
        </div>
        <span className="text-xs text-gray-400">
          {job.deadline === '상시채용' ? '상시채용' : `~ ${job.deadline}`}
        </span>
      </div>

      {/* 직무명 */}
      <h2 className="text-lg font-bold text-gray-900 mb-4 group-hover:text-kt-red transition-colors">
        {job.title}
      </h2>

      {/* 태그 */}
      <div className="flex flex-wrap gap-1">
        {job.tags.map((tag) => (
          <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
            {tag}
          </span>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-sm text-kt-red font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        선배한테 물어보기 →
      </div>
    </div>
  )
}

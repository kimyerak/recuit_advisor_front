import { Mentor } from '@/types/mentor'

interface Props {
  mentor: Mentor
  selected: boolean
  onSelect: (id: string) => void
}

export default function MentorCard({ mentor, selected, onSelect }: Props) {
  return (
    <button
      onClick={() => onSelect(mentor.id)}
      className={`relative flex flex-col items-center text-center p-6 rounded-2xl border-2 transition-all duration-200 ${
        selected
          ? 'border-kt-red bg-red-50 shadow-md'
          : 'border-gray-200 bg-white hover:border-kt-red hover:shadow-sm'
      }`}
    >
      {/* 선택 체크 */}
      {selected && (
        <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-kt-red flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      )}

      {/* 이모지 아바타 */}
      <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 ${
        selected ? 'bg-red-100' : 'bg-gray-100'
      }`}>
        {mentor.emoji}
      </div>

      {/* 이름 + 직책 */}
      <p className="font-bold text-gray-900 text-base mb-1">{mentor.name}</p>
      <p className="text-xs text-kt-red font-medium mb-3">{mentor.role}</p>

      {/* 커리어 */}
      <p className="text-xs text-gray-400 mb-4 leading-relaxed">{mentor.career}</p>

      {/* 태그 */}
      <div className="flex flex-wrap justify-center gap-1">
        {mentor.tags.map((tag) => (
          <span
            key={tag}
            className={`text-xs px-2 py-1 rounded-full font-medium ${
              selected ? 'bg-red-100 text-kt-red' : 'bg-gray-100 text-gray-500'
            }`}
          >
            #{tag}
          </span>
        ))}
      </div>
    </button>
  )
}

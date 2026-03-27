export type Intent = 'jd' | 'story' | 'resume'

export interface IntentOption {
  id: Intent
  emoji: string
  label: string
  description: string
}

export const INTENT_OPTIONS: IntentOption[] = [
  {
    id: 'jd',
    emoji: '📄',
    label: '채용공고 질문',
    description: 'JD 내용, 자격요건, 업무, 근무조건 궁금해요',
  },
  {
    id: 'story',
    emoji: '💬',
    label: '선배 이야기',
    description: '실무 경험, 직무 분위기, 커리어 조언이 궁금해요',
  },
  {
    id: 'resume',
    emoji: '✏️',
    label: '자소서 조언',
    description: '합격 선배 자소서 기반으로 내 자소서 봐주세요',
  },
]

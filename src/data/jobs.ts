import { Job } from '@/types/job'

export const JOBS: Job[] = [
  {
    id: 'cloud-migration',
    title: 'Cloud 이행',
    type: '경력채용',
    department: 'IT인프라',
    deadline: '2025-05-31',
    tags: ['AWS', 'Azure', '클라우드 마이그레이션', 'IaaS'],
  },
  {
    id: 'network-infra',
    title: '네트워크 인프라',
    type: '신입채용',
    department: '네트워크인프라',
    deadline: '2025-04-30',
    tags: ['네트워크', 'CCNA', '라우팅/스위칭'],
  },
  {
    id: 'ai-dx',
    title: 'AI/DX 개발',
    type: '경력채용',
    department: 'AI2XL연구소',
    deadline: '상시채용',
    tags: ['Python', 'LLM', 'MLOps', '딥러닝'],
  },
  {
    id: 'security',
    title: '정보보안',
    type: '경력채용',
    department: '정보보안',
    deadline: '2025-06-15',
    tags: ['ISMS', '침해대응', '보안관제'],
  },
  {
    id: 'sw-dev',
    title: '소프트웨어 개발',
    type: '신입채용',
    department: 'DX개발',
    deadline: '2025-05-15',
    tags: ['Java', 'Spring', 'React', 'DevOps'],
  },
]

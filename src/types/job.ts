export type JobType = '신입채용' | '경력채용' | '인턴'

export interface Job {
  id: string
  title: string          // 직무명 (예: "Cloud 이행")
  type: JobType          // 채용 구분
  department: string     // 부서/사업 영역
  deadline: string       // 마감일 (예: "2025-04-30" | "상시채용")
  tags: string[]         // 키워드 태그 (예: ["AWS", "네트워크", "클라우드"])
  pdfFile?: string       // 연결된 PDF 파일명
}

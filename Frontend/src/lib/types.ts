export enum ReportStatus {
  Submitted = 'Submitted',
  InProgress = 'In Progress',
  Resolved = 'Resolved',
  Closed = 'Closed',
}

export enum EmployeeType {
    FullTime = 'Full-Time',
    PartTime = 'Part-Time',
    Contractor = 'Contractor',
    Intern = 'Intern'
}

export interface User {
  id: string
  name: string
  email: string
  employeeCode: string
  password?: string // Should be hashed in a real app
  role: 'employee' | 'admin'
}

export interface Report {
  id: string
  employeeName: string
  employeeCode: string
  employeeType: EmployeeType
  department: string
  description: string
  image: string // data URI
  status: ReportStatus
  submittedAt: Date
  submittedBy: string // user id
  reply: string | null
  repliedAt: Date | null
}

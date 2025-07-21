
'use server'

import { z } from 'zod'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { User, Report, ReportStatus, EmployeeType } from '@/lib/types'
import { suggestDepartment as suggestDepartmentFlow, SuggestDepartmentInput } from '@/ai/flows/suggest-department'

// In-memory data stores
const users: User[] = []
const reports: Report[] = []
let reportIdCounter = 1

const departments = ['IT', 'HR', 'Facilities', 'Maintenance', 'Operations', 'Finance', 'Legal'];

// --- AUTH ACTIONS ---

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  employeeCode: z.string().min(1, 'Employee code is required'),
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export async function registerEmployee(values: z.infer<typeof registerSchema>) {
  const validatedFields = registerSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: 'Invalid fields' }
  }

  const { name, employeeCode, email, password } = validatedFields.data

  if (users.find(u => u.email === email)) {
    return { error: 'User with this email already exists' }
  }

  const newUser: User = {
    id: String(users.length + 1),
    name,
    email,
    employeeCode,
    password, // In a real app, hash this password
    role: 'employee',
  }
  users.push(newUser)

  await createSession(newUser)
  redirect('/report')
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
})

export async function loginEmployee(values: z.infer<typeof loginSchema>) {
  const validatedFields = loginSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: 'Invalid fields' }
  }

  const { email, password } = validatedFields.data

  const user = users.find(u => u.email === email && u.role === 'employee')
  if (!user || user.password !== password) {
    return { error: 'Invalid credentials' }
  }

  await createSession(user)
  redirect('/report')
}

const adminLoginSchema = z.object({
  passcode: z.string().min(1, 'Passcode is required'),
})

export async function loginAdmin(values: z.infer<typeof adminLoginSchema>) {
  const validatedFields = adminLoginSchema.safeParse(values)
  if (!validatedFields.success) {
    return { error: 'Invalid fields' }
  }

  const { passcode } = validatedFields.data
  const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || 'admin123'

  if (passcode !== ADMIN_PASSCODE) {
    return { error: 'Invalid passcode' }
  }

  const adminUser: User = {
    id: 'admin',
    name: 'Admin',
    email: 'admin@company.com',
    employeeCode: 'ADMIN',
    role: 'admin',
  }

  await createSession(adminUser)
  redirect('/dashboard')
}

async function createSession(user: User) {
  const sessionData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
  const sessionValue = Buffer.from(JSON.stringify(sessionData)).toString('base64')
  cookies().set('session', sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  })
}

export async function logout() {
  cookies().delete('session')
  redirect('/')
}

export async function getSession() {
  const sessionValue = cookies().get('session')?.value
  if (!sessionValue) return null
  try {
    return JSON.parse(Buffer.from(sessionValue, 'base64').toString())
  } catch {
    return null
  }
}

// --- REPORT ACTIONS ---

const reportSchema = z.object({
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeCode: z.string().min(1, 'Employee code is required'),
  employeeType: z.nativeEnum(EmployeeType),
  department: z.string().refine(val => departments.includes(val), {message: "Invalid department"}),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  image: z.string().url('A valid image data URI is required'),
})

export async function createReport(values: z.infer<typeof reportSchema>) {
  const user = await getSession();
  if (!user || user.role !== 'employee') {
    return { error: 'Unauthorized' };
  }

  const validatedFields = reportSchema.safeParse(values)
  if (!validatedFields.success) {
    const errors = validatedFields.error.flatten().fieldErrors;
    return { error: `Invalid fields. ${JSON.stringify(errors)}` }
  }

  const newReport: Report = {
    id: String(reportIdCounter++),
    ...validatedFields.data,
    status: ReportStatus.Submitted,
    submittedAt: new Date(),
    submittedBy: user.id,
    reply: null,
    repliedAt: null,
  }
  reports.unshift(newReport) // Add to the beginning of the array
  
  return { success: 'Report submitted successfully!' }
}

export async function getMyReports() {
  const user = await getSession();
  if (!user || user.role !== 'employee') {
    return [];
  }
  return reports.filter(r => r.submittedBy === user.id);
}

export async function getAllReports() {
  const user = await getSession();
  if (!user || user.role !== 'admin') {
    return [];
  }
  return reports;
}

const replySchema = z.object({
  reportId: z.string(),
  reply: z.string().min(1, "Reply message is required."),
  status: z.nativeEnum(ReportStatus)
})

export async function replyToReport(values: z.infer<typeof replySchema>) {
  const user = await getSession();
  if (!user || user.role !== 'admin') {
    return { error: 'Unauthorized' };
  }
  
  const validatedFields = replySchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: "Invalid data provided." };
  }

  const { reportId, reply, status } = validatedFields.data;

  const reportIndex = reports.findIndex(r => r.id === reportId);
  if (reportIndex === -1) {
    return { error: "Report not found." };
  }

  reports[reportIndex].reply = reply;
  reports[reportIndex].status = status;
  reports[reportIndex].repliedAt = new Date();

  return { success: "Reply sent successfully." };
}

export async function suggestDepartment(input: SuggestDepartmentInput) {
    const user = await getSession();
    if (!user) {
        return { error: 'Unauthorized' };
    }

    try {
        const result = await suggestDepartmentFlow(input);
        return { suggestion: result.suggestedDepartment };
    } catch (e) {
        return { error: 'Failed to get suggestion from AI.' };
    }
}

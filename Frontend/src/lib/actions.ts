
'use server'

import { z } from 'zod'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { User, Report, ReportStatus, EmployeeType } from '@/lib/types'
import { suggestDepartment as suggestDepartmentFlow, SuggestDepartmentInput } from '@/ai/flows/suggest-department'
import { AppwriteAuthService, AppwriteReportService } from '@/lib/appwrite-services'

// Fallback in-memory data stores for development (optional)
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

  // Use Appwrite service for registration
  const result = await AppwriteAuthService.registerEmployee({
    name,
    email,
    password,
    employeeCode
  })

  if (result.error) {
    return { error: result.error }
  }

  // Create a local session for compatibility after successful registration
  if (result.user) {
    await createSession(result.user)
  }

  // Return success instead of redirecting to avoid middleware conflicts
  return { success: true, redirectTo: '/report' }
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

  // Use Appwrite service for login
  const result = await AppwriteAuthService.loginEmployee(email, password)

  if (result.error) {
    return { error: result.error }
  }

  // Create a local session for compatibility
  if (result.user) {
    await createSession(result.user)
  }
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

  // Use Appwrite service for admin login
  const result = await AppwriteAuthService.loginAdmin(passcode)

  if (result.error) {
    return { error: result.error }
  }

  // Create a local session for compatibility
  if (result.user) {
    await createSession(result.user)
  }
  redirect('/dashboard')
}

async function createSession(user: any) {
  const sessionData = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  }
  const sessionValue = Buffer.from(JSON.stringify(sessionData)).toString('base64')
  const cookieStore = await cookies()
  cookieStore.set('session', sessionValue, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  })
}

export async function logout() {
  // Logout from Appwrite
  await AppwriteAuthService.logout()
  
  // Clear local session
  const cookieStore = await cookies()
  cookieStore.delete('session')
  redirect('/')
}

export async function getSession() {
  const cookieStore = await cookies()
  const sessionValue = cookieStore.get('session')?.value
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

  // Use Appwrite service to create report
  const result = await AppwriteReportService.createReport({
    ...validatedFields.data,
    submittedBy: user.id
  })

  if (result.error) {
    return { error: result.error }
  }
  
  return { success: 'Report submitted successfully!' }
}

export async function getMyReports() {
  const user = await getSession();
  console.log('getMyReports - user session:', user);
  
  if (!user || user.role !== 'employee') {
    console.log('getMyReports - user not authorized or not employee');
    return [];
  }
  
  console.log('getMyReports - calling with userId:', user.id);
  // Use Appwrite service to get reports
  return await AppwriteReportService.getMyReports(user.id);
}

export async function getAllReports() {
  const user = await getSession();
  if (!user || user.role !== 'admin') {
    return [];
  }
  
  // Use Appwrite service to get all reports
  return await AppwriteReportService.getAllReports();
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

  // Use Appwrite service to update report
  const result = await AppwriteReportService.replyToReport(reportId, reply, status)

  if (result.error) {
    return { error: result.error };
  }

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

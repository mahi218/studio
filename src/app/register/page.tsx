import { EmployeeRegisterForm } from '@/components/auth/EmployeeRegisterForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'

export default function EmployeeRegisterPage() {
  return (
    <div className="w-full max-w-md">
      <Card className="shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
          <CardDescription>Fill in your details to get started.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeRegisterForm />
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/" className="underline text-accent-foreground hover:text-accent transition-colors">
              Login here
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

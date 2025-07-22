import { EmployeeLoginForm } from '@/components/auth/EmployeeLoginForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'

export default function EmployeeLoginPage() {
  return (
    <div className="w-full max-w-md">
      <Card className="shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Employee Login</CardTitle>
          <CardDescription>Enter your credentials to report an issue.</CardDescription>
        </CardHeader>
        <CardContent>
          <EmployeeLoginForm />
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline text-accent-foreground hover:text-accent transition-colors">
              Register here
            </Link>
             <br/>
            <Link href="/admin/login" className="underline text-sm text-muted-foreground hover:text-accent transition-colors">
              Manager Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

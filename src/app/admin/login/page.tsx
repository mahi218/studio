import { AdminLoginForm } from '@/components/auth/AdminLoginForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'

export default function AdminLoginPage() {
  return (
    <div className="w-full max-w-md">
      <Card className="shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-headline">Manager Access</CardTitle>
          <CardDescription>Enter the passcode to access the dashboard.</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
           <div className="mt-4 text-center text-sm">
            <Link href="/" className="underline text-muted-foreground hover:text-accent transition-colors">
              Return to Employee Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { registerEmployee } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { AlertCircle } from 'lucide-react'

const RegisterSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
  employeeCode: z.string().min(1, { message: 'Employee code is required.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string()
    .min(8, { message: 'Password must be at least 8 characters.' })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, { 
      message: 'Password must contain at least one lowercase letter, one uppercase letter, and one number.' 
    }),
})

export function EmployeeRegisterForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const form = useForm<z.infer<typeof RegisterSchema>>({
    resolver: zodResolver(RegisterSchema),
    defaultValues: {
      name: '',
      employeeCode: '',
      email: '',
      password: '',
    },
  })

  const onSubmit = (values: z.infer<typeof RegisterSchema>) => {
    setError(null)
    startTransition(async () => {
      const result = await registerEmployee(values)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success && result?.redirectTo) {
        // Redirect on client side to avoid middleware conflicts
        router.push(result.redirectTo)
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} disabled={isPending}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="employeeCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Employee Code</FormLabel>
              <FormControl>
                <Input placeholder="EMP123" {...field} disabled={isPending}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email Address</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john.doe@company.com" {...field} disabled={isPending}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} disabled={isPending}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={isPending}>
          {isPending ? 'Registering...' : 'Register'}
        </Button>
      </form>
    </Form>
  )
}

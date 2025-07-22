'use client'

import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { loginAdmin } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'
import { AlertCircle } from 'lucide-react'

const AdminLoginSchema = z.object({
  passcode: z.string().min(1, { message: 'Passcode is required.' }),
})

export function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof AdminLoginSchema>>({
    resolver: zodResolver(AdminLoginSchema),
    defaultValues: {
      passcode: '',
    },
  })

  const onSubmit = (values: z.infer<typeof AdminLoginSchema>) => {
    setError(null)
    startTransition(async () => {
      const result = await loginAdmin(values)
      if (result?.error) {
        setError(result.error)
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
          name="passcode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Admin Passcode</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} disabled={isPending} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full" disabled={isPending}>
          {isPending ? 'Accessing...' : 'Enter Dashboard'}
        </Button>
      </form>
    </Form>
  )
}

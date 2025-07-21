'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createReport, suggestDepartment } from '@/lib/actions'
import { EmployeeType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'
import { User } from '@/lib/types'
import { AlertCircle, BrainCircuit, ImageIcon, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '../ui/alert'

const departments = ['IT', 'HR', 'Facilities', 'Maintenance', 'Operations', 'Finance', 'Legal']

const ReportSchema = z.object({
  employeeName: z.string().min(1, 'Employee name is required'),
  employeeCode: z.string().min(1, 'Employee code is required'),
  employeeType: z.nativeEnum(EmployeeType, { required_error: 'Employee type is required' }),
  department: z.string().refine(val => departments.includes(val), { message: "Please select a department" }),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  image: z.string().refine(val => val.startsWith('data:image/'), { message: 'A valid image upload is required' }),
})

type ReportFormValues = z.infer<typeof ReportSchema>

interface IssueReportFormProps {
  user: User
}

export function IssueReportForm({ user }: IssueReportFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [isSuggesting, startSuggestionTransition] = useTransition()
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm<ReportFormValues>({
    resolver: zodResolver(ReportSchema),
    defaultValues: {
      employeeName: user.name,
      employeeCode: user.employeeCode,
      description: '',
    },
  })
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const dataUrl = reader.result as string
        setImagePreview(dataUrl)
        form.setValue('image', dataUrl, { shouldValidate: true })
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSuggestDepartment = () => {
    const description = form.getValues('description')
    const image = form.getValues('image')

    if (!description || !image) {
      toast({
        variant: 'destructive',
        title: 'Suggestion Failed',
        description: 'Please provide a description and upload an image first.',
      })
      return
    }

    startSuggestionTransition(async () => {
      const result = await suggestDepartment({ description, image })
      if (result.error) {
        toast({ variant: 'destructive', title: 'AI Error', description: result.error })
      } else if (result.suggestion) {
        if(departments.includes(result.suggestion)) {
          form.setValue('department', result.suggestion, { shouldValidate: true })
          toast({ title: 'Suggestion Applied', description: `Department set to ${result.suggestion}.` })
        } else {
           toast({ variant: 'destructive', title: 'Invalid Suggestion', description: `AI suggested an invalid department: ${result.suggestion}. Please select one manually.` })
        }
      }
    })
  }

  const onSubmit = (values: ReportFormValues) => {
    setError(null)
    setSuccess(null)
    startTransition(async () => {
      const result = await createReport(values)
      if (result.error) {
        setError(result.error)
        toast({ variant: 'destructive', title: 'Submission Failed', description: result.error })
      }
      if (result.success) {
        setSuccess(result.success)
        toast({ title: 'Success', description: result.success })
        form.reset()
        setImagePreview(null)
      }
    })
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && <Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        {success && <Alert variant="default" className="bg-accent/20"><AlertCircle className="h-4 w-4" /><AlertTitle>Success</AlertTitle><AlertDescription>{success}</AlertDescription></Alert>}
        
        <div className="grid md:grid-cols-2 gap-6">
          <FormField control={form.control} name="employeeName" render={({ field }) => (
            <FormItem><FormLabel>Employee Name</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>
          )} />
          <FormField control={form.control} name="employeeCode" render={({ field }) => (
            <FormItem><FormLabel>Employee Code</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>
          )} />
        </div>
        
        <FormField control={form.control} name="employeeType" render={({ field }) => (
          <FormItem><FormLabel>Employee Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
              <FormControl><SelectTrigger><SelectValue placeholder="Select your employment type" /></SelectTrigger></FormControl>
              <SelectContent>
                {Object.values(EmployeeType).map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
              </SelectContent>
            </Select><FormMessage /></FormItem>
        )} />

        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem><FormLabel>Description of Issue</FormLabel><FormControl>
            <Textarea placeholder="Describe the problem in detail..." {...field} rows={5} disabled={isPending} />
          </FormControl><FormMessage /></FormItem>
        )} />
        
        <FormField control={form.control} name="image" render={({ field }) => (
          <FormItem><FormLabel>Image</FormLabel><FormControl>
            <div className="w-full p-4 border-2 border-dashed rounded-lg text-center cursor-pointer hover:border-primary transition-colors">
              <Input type="file" accept="image/*" onChange={handleImageChange} className="hidden" id="image-upload" disabled={isPending}/>
              <label htmlFor="image-upload" className="cursor-pointer">
                {imagePreview ? (
                  <Image src={imagePreview} alt="Preview" width={200} height={200} className="mx-auto rounded-md shadow-md" />
                ) : (
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <ImageIcon className="w-10 h-10" />
                    <span>Click to upload an image</span>
                  </div>
                )}
              </label>
            </div>
          </FormControl><FormMessage /></FormItem>
        )} />
        
        <div className="grid md:grid-cols-2 gap-6 items-end">
          <FormField control={form.control} name="department" render={({ field }) => (
            <FormItem><FormLabel>Department</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value} disabled={isPending || isSuggesting}>
                <FormControl><SelectTrigger><SelectValue placeholder="Select a department" /></SelectTrigger></FormControl>
                <SelectContent>
                  {departments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}
                </SelectContent>
              </Select><FormMessage /></FormItem>
          )} />
          <Button type="button" variant="outline" onClick={handleSuggestDepartment} disabled={isSuggesting}>
            {isSuggesting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
            {isSuggesting ? 'Thinking...' : 'AI Suggest Department'}
          </Button>
        </div>

        <Button type="submit" className="w-full text-lg py-6" disabled={isPending}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {isPending ? 'Submitting...' : 'Submit Report'}
        </Button>
      </form>
    </Form>
  )
}

'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Report, ReportStatus, EmployeeType } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '../ui/badge'
import { Label } from '../ui/label'
import { format } from 'date-fns'

interface ReportDetailsDialogProps {
  report: Report
  isOpen: boolean
  onOpenChange: (isOpen: boolean) => void
  onReplySubmit: (reportId: string, reply: string, status: ReportStatus) => Promise<void>
}

export function ReportDetailsDialog({ report, isOpen, onOpenChange, onReplySubmit }: ReportDetailsDialogProps) {
  const [reply, setReply] = React.useState(report.reply || '')
  const [status, setStatus] = React.useState<ReportStatus>(report.status)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleSubmit = async () => {
    setIsSubmitting(true)
    await onReplySubmit(report.id, reply, status)
    setIsSubmitting(false)
  }

  React.useEffect(() => {
    if (isOpen) {
      setReply(report.reply || '')
      setStatus(report.status)
    }
  }, [isOpen, report])
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className='font-headline'>Report from {report.employeeName}</DialogTitle>
          <DialogDescription>
            Submitted on {format(new Date(report.submittedAt), 'PPP p')}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 py-4 max-h-[70vh] overflow-y-auto pr-4">
            <div className='flex justify-center'>
                 <Image src={report.image} alt="Report image" width={400} height={300} className="rounded-lg shadow-md border" data-ai-hint="issue photo" />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div>
                    <Label className='text-xs text-muted-foreground'>Employee</Label>
                    <p>{report.employeeName} ({report.employeeCode})</p>
                </div>
                <div>
                    <Label className='text-xs text-muted-foreground'>Employee Type</Label>
                    <p>{report.employeeType}</p>
                </div>
                <div>
                    <Label className='text-xs text-muted-foreground'>Department</Label>
                    <p>{report.department}</p>
                </div>
                 <div>
                    <Label className='text-xs text-muted-foreground'>Status</Label>
                    <p><Badge>{report.status}</Badge></p>
                </div>
            </div>

            <div>
                <Label className='text-xs text-muted-foreground'>Description</Label>
                <p className='p-3 bg-secondary/50 rounded-md border'>{report.description}</p>
            </div>

            <div className="space-y-2">
                <Label htmlFor="reply">Your Reply</Label>
                <Textarea
                    id="reply"
                    placeholder="Type your reply to the employee here..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    rows={4}
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="status">Update Status</Label>
                <Select value={status} onValueChange={(value: ReportStatus) => setStatus(value)}>
                    <SelectTrigger id="status">
                        <SelectValue placeholder="Update report status" />
                    </SelectTrigger>
                    <SelectContent>
                        {Object.values(ReportStatus).map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!reply || isSubmitting}>
            {isSubmitting ? 'Submitting...' : 'Submit Reply & Update Status'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

import { BugPlay } from 'lucide-react'

export default function Logo() {
  return (
    <div className="flex items-center gap-2 text-primary">
      <BugPlay className="h-7 w-7 text-accent" />
      <span className="text-xl font-bold font-headline tracking-tighter">
        IssueTrack Pro
      </span>
    </div>
  )
}

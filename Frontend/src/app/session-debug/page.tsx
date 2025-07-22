'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function SessionDebugPage() {
  const [sessionInfo, setSessionInfo] = useState<any>(null)

  const checkSession = async () => {
    try {
      const response = await fetch('/api/debug-session')
      const data = await response.json()
      setSessionInfo(data)
    } catch (error) {
      console.error('Error checking session:', error)
    }
  }

  useEffect(() => {
    checkSession()
  }, [])

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Session Debug</h1>
      
      <div className="space-y-4">
        <Button onClick={checkSession}>
          Refresh Session Info
        </Button>
        
        <div>
          <h2 className="text-lg font-semibold">Current Session:</h2>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
            {sessionInfo ? JSON.stringify(sessionInfo, null, 2) : 'Loading...'}
          </pre>
        </div>
      </div>
    </div>
  )
}

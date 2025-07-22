'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'

export default function DebugPage() {
  const [cookies, setCookies] = useState<string>('')

  useEffect(() => {
    setCookies(document.cookie)
  }, [])

  const clearCookies = () => {
    // Clear all cookies for this domain
    document.cookie.split(";").forEach(function(c) { 
      document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
    });
    
    // Reload page
    window.location.reload()
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
      
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Current Cookies:</h2>
          <pre className="bg-gray-100 p-2 rounded text-sm">{cookies || 'No cookies'}</pre>
        </div>
        
        <Button onClick={clearCookies} variant="destructive">
          Clear All Cookies & Reload
        </Button>
        
        <div className="space-y-2">
          <Button onClick={() => window.location.href = '/'}>Go to Home</Button>
          <Button onClick={() => window.location.href = '/register'}>Go to Register</Button>
          <Button onClick={() => window.location.href = '/report'}>Go to Report</Button>
        </div>
      </div>
    </div>
  )
}

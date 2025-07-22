import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const sessionValue = cookieStore.get('session')?.value
    
    if (!sessionValue) {
      return NextResponse.json({ error: 'No session found' })
    }
    
    const sessionData = JSON.parse(Buffer.from(sessionValue, 'base64').toString())
    
    return NextResponse.json({
      sessionExists: true,
      sessionData,
      rawSessionValue: sessionValue.substring(0, 50) + '...'
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to parse session',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

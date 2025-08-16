import { NextResponse } from 'next/server'
import { appConfig } from '@/lib/app-config'

export async function GET() {
  const { name, version, buildHash, buildDate, buildBranch, endpoints, environment } = appConfig
  return NextResponse.json({ name, version, buildHash, buildDate, buildBranch, endpoints, environment })
}


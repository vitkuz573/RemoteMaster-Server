import { NextResponse } from 'next/server'
import fs from 'node:fs'
import path from 'node:path'

type Pkg = {
  name?: string
  version?: string
  engines?: { node?: string }
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

export async function GET() {
  try {
    const p = path.join(process.cwd(), 'package.json')
    const pkg = JSON.parse(fs.readFileSync(p, 'utf8')) as Pkg
    const { name, version, engines, dependencies, devDependencies } = pkg
    return NextResponse.json({ name, version, engines, dependencies, devDependencies })
  } catch (e) {
    return NextResponse.json({ error: 'unable_to_read_package_json' }, { status: 500 })
  }
}


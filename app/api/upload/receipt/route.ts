import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const uploadDir = join(process.cwd(), 'public/uploads/receipts')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (err) {
      // Ignore if directory exists
    }

    const filename = `${uuidv4()}-${file.name.replace(/\s+/g, '-')}`
    const path = join(uploadDir, filename)
    await writeFile(path, buffer)

    return NextResponse.json({ 
      url: `/uploads/receipts/${filename}`
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}

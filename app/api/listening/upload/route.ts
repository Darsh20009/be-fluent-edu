import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !['ADMIN', 'TEACHER'].includes(session.user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const allowedAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

    let allowedTypes: string[]
    let folder: string
    let maxSize: number

    if (type === 'audio') {
      allowedTypes = allowedAudioTypes
      folder = 'audio'
      maxSize = 50 * 1024 * 1024
    } else if (type === 'video') {
      allowedTypes = allowedVideoTypes
      folder = 'video'
      maxSize = 200 * 1024 * 1024
    } else if (type === 'thumbnail') {
      allowedTypes = allowedImageTypes
      folder = 'thumbnails'
      maxSize = 5 * 1024 * 1024
    } else {
      return NextResponse.json({ error: 'Invalid file type. Use: audio, video, or thumbnail' }, { status: 400 })
    }

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}` 
      }, { status: 400 })
    }

    if (file.size > maxSize) {
      return NextResponse.json({ 
        error: `File too large. Max size: ${maxSize / 1024 / 1024}MB` 
      }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const ext = file.name.split('.').pop()
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 8)
    const fileName = `listening-${timestamp}-${randomId}.${ext}`

    const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'listening', folder)
    await mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, fileName)
    await writeFile(filePath, buffer)

    const publicUrl = `/uploads/listening/${folder}/${fileName}`

    return NextResponse.json({ 
      success: true, 
      url: publicUrl,
      fileName,
      type: folder
    })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 })
  }
}

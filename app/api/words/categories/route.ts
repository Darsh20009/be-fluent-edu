import { NextRequest, NextResponse } from 'next/server'
import { getCategoriesWithCounts, CATEGORIES } from '@/lib/words-database'

export async function GET(request: NextRequest) {
  try {
    const categoriesWithCounts = getCategoriesWithCounts()
    
    return NextResponse.json({ 
      categories: categoriesWithCounts,
      total: categoriesWithCounts.length
    })
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

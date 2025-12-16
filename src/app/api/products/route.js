import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const active = searchParams.get('active')

    let query = supabaseAdmin
      .from('products')
      .select('*')

    if (category && category !== 'all') {
      query = query.eq('category', category)
    }

    if (active) {
      query = query.eq('is_active', active === 'true')
    }

    const { data, error } = await query.order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json(data)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const productData = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('products')
      .insert([productData])
      .select()

    if (error) throw error
    return NextResponse.json(data[0])
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
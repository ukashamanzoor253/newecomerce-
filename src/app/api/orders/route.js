import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const userId = searchParams.get('user_id')

    let query = supabaseAdmin
      .from('orders')
      .select(`
        *,
        products (*),
        profiles (*)
      `)

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    if (userId) {
      query = query.eq('user_id', userId)
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
    const orderData = await request.json()
    
    const { data, error } = await supabaseAdmin
      .from('orders')
      .insert([orderData])
      .select()

    if (error) throw error
    return NextResponse.json(data[0])
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const { orderId, status } = await request.json()
    
    const { error } = await supabaseAdmin
      .from('orders')
      .update({ status })
      .eq('id', orderId)

    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
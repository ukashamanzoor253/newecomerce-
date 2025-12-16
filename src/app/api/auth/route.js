import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request) {
  try {
    const { action, data } = await request.json()

    switch(action) {
      case 'check_user':
        const { data: userData } = await supabaseAdmin
          .from('profiles')
          .select('*')
          .eq('email', data.email)
          .single()
        return NextResponse.json({ user: userData })

      case 'update_role':
        const { error: roleError } = await supabaseAdmin
          .from('profiles')
          .update({ role: data.role })
          .eq('id', data.userId)

        if (roleError) throw roleError
        return NextResponse.json({ success: true })

      case 'update_limits':
        const { error: limitError } = await supabaseAdmin
          .from('profiles')
          .update({ 
            user_limit: data.user_limit,
            order_time_limit: data.order_time_limit
          })
          .eq('id', data.userId)

        if (limitError) throw limitError
        return NextResponse.json({ success: true })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
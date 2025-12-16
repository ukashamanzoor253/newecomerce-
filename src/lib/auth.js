import { supabase } from './supabase'

export async function signUp(email, password, userData) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: `${window.location.origin}/login`
      }
    })

    if (authError) throw authError

    // Create profile for the new user
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email: email,
          role: 'user',
          user_limit: 5
        }
      ])

    if (profileError) throw profileError

    return authData
  } catch (error) {
    console.error('Sign up error:', error)
    throw error
  }
}

export async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()

    if (!profile) {
      throw new Error('User profile not found')
    }

    return { user: data.user, profile }
  } catch (error) {
    console.error('Sign in error:', error)
    throw error
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  } catch (error) {
    console.error('Sign out error:', error)
    throw error
  }
}

export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) throw error
    if (!user) return null

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return { user, profile }
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

export async function updateUserLimit(userId, limit) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ user_limit: limit })
      .eq('id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Update user limit error:', error)
    throw error
  }
}

export async function setOrderTimeLimit(userId, endTime) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ order_time_limit: endTime })
      .eq('id', userId)

    if (error) throw error
  } catch (error) {
    console.error('Set order time limit error:', error)
    throw error
  }
}
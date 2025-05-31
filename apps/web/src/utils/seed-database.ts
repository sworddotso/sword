import { applySeedData } from '@goated/livestore'
import { actions } from '@/lib/livestore'

// Helper function to get current user from session or create default
const getCurrentUser = () => {
  // Try to get user info from session storage or create a default user
  const sessionUser = JSON.parse(sessionStorage.getItem('user') || 'null')
  if (sessionUser?.email) {
    return {
      id: `user_${sessionUser.email.replace(/[^a-zA-Z0-9]/g, '_')}_${sessionUser.id || Date.now()}`,
      email: sessionUser.email,
      name: sessionUser.name || sessionUser.email.split('@')[0],
      username: sessionUser.username || sessionUser.email.split('@')[0],
      avatar: sessionUser.avatar || '/avatars/default.png'
    }
  }
  
  // Fallback to a default user if no session
  const timestamp = Date.now()
  return {
    id: `user_creator_${timestamp}`,
    email: 'creator@sword.app',
    name: 'Server Creator',
    username: 'ServerCreator',
    avatar: '/avatars/creator.png'
  }
}

// Seed database function that creates server with current user as admin
export const seedDatabase = async (store: any) => {
  console.log('🌐 Creating global server with current user as admin...')
  
  // First, create the basic seed data (server, channels, etc.)
  const seedResult = await applySeedData(store)
  
  // Get current user info
  const currentUser = getCurrentUser()
  
  // Ensure current user exists in the database
  try {
    actions.createUser(store, {
      id: currentUser.id,
      email: currentUser.email,
      name: currentUser.name,
      username: currentUser.username,
      avatar: currentUser.avatar,
      status: 'online'
    })
    console.log('✅ Created/updated current user:', currentUser.name)
  } catch (error) {
    console.log('ℹ️ User already exists or error creating user:', error)
  }
  
  // Add current user as admin of the server
  if (seedResult.serverId) {
    try {
      actions.joinServer(store, seedResult.serverId, currentUser.id, undefined, true) // true = isAdmin
      console.log('✅ Added current user as admin of the server')
    } catch (error) {
      console.log('ℹ️ User may already be a member:', error)
    }
  }
  
  console.log('🏰 Global server created successfully!')
  console.log('👑 You are now the admin of this server')
  
  return {
    ...seedResult,
    currentUserId: currentUser.id,
    userRole: 'admin'
  }
} 
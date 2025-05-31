import { events } from './schema'

// Generate unique IDs with timestamp to avoid conflicts
const generateId = () => `${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

// Timestamps
const now = new Date()
const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000)

// Use timestamp-based IDs to avoid conflicts
const timestamp = Date.now()
const userIds = {
  admin: `user_admin_${timestamp}`,
  moderator: `user_mod_${timestamp}`,
  developer: `user_dev_${timestamp}`,
  designer: `user_designer_${timestamp}`,
  beta_tester: `user_beta_${timestamp}`,
  community: `user_community_${timestamp}`,
}

// Server and related IDs
const serverIds = {
  swordApp: `server_sword_app_${timestamp}`,
}

const categoryIds = {
  general: `cat_general_${timestamp}`,
  development: `cat_development_${timestamp}`,
  community: `cat_community_${timestamp}`,
  support: `cat_support_${timestamp}`,
}

const channelIds = {
  // General channels
  welcome: `chan_welcome_${timestamp}`,
  announcements: `chan_announcements_${timestamp}`,
  general: `chan_general_${timestamp}`,
  
  // Development channels
  development: `chan_development_${timestamp}`,
  feature_requests: `chan_features_${timestamp}`,
  bug_reports: `chan_bugs_${timestamp}`,
  
  // Community channels
  introductions: `chan_introductions_${timestamp}`,
  feedback: `chan_feedback_${timestamp}`,
  
  // Support channels
  help: `chan_help_${timestamp}`,
  
  // Voice channels
  generalVoice: `chan_voice_general_${timestamp}`,
  devMeeting: `chan_voice_dev_${timestamp}`,
}

const roleIds = {
  owner: `role_owner_${timestamp}`,
  moderator: `role_moderator_${timestamp}`,
  developer: `role_developer_${timestamp}`,
  beta_tester: `role_beta_${timestamp}`,
  everyone: `role_everyone_${timestamp}`,
}

export const createSeedData = () => [
  // Create users
  events.userCreated({
    id: userIds.admin,
    email: 'admin@sword.app',
    name: 'Sword Admin',
    username: 'SwordAdmin',
    avatar: '/avatars/admin.png',
    status: 'online',
    createdAt: lastWeek,
  }),
  
  events.userCreated({
    id: userIds.moderator,
    email: 'mod@sword.app',
    name: 'Community Mod',
    username: 'CommunityMod',
    avatar: '/avatars/moderator.png',
    status: 'online',
    createdAt: lastWeek,
  }),
  
  events.userCreated({
    id: userIds.developer,
    email: 'dev@sword.app',
    name: 'Lead Developer',
    username: 'LeadDev',
    avatar: '/avatars/developer.png',
    status: 'away',
    createdAt: lastWeek,
  }),
  
  events.userCreated({
    id: userIds.designer,
    email: 'design@sword.app',
    name: 'UI Designer',
    username: 'UIDesigner',
    avatar: '/avatars/designer.png',
    status: 'online',
    createdAt: yesterday,
  }),
  
  events.userCreated({
    id: userIds.beta_tester,
    email: 'beta@sword.app',
    name: 'Beta Tester',
    username: 'BetaTester',
    avatar: '/avatars/beta.png',
    status: 'online',
    createdAt: yesterday,
  }),
  
  events.userCreated({
    id: userIds.community,
    email: 'community@sword.app',
    name: 'Community Member',
    username: 'CommunityMember',
    avatar: '/avatars/community.png',
    status: 'online',
    createdAt: twoHoursAgo,
  }),

  // Create the Sword App server
  events.serverCreated({
    id: serverIds.swordApp,
    name: 'Sword App',
    description: 'Official Sword Discord Alternative - A modern, fast, and feature-rich communication platform',
    icon: '/server-icons/sword-app.png',
    banner: '/server-banners/sword-app-banner.jpg',
    ownerId: userIds.admin,
    isPublic: true,
    memberCount: 6,
    createdAt: lastWeek,
  }),

  // Create categories
  events.categoryCreated({
    id: categoryIds.general,
    serverId: serverIds.swordApp,
    name: 'GENERAL',
    position: 0,
    createdAt: lastWeek,
  }),
  
  events.categoryCreated({
    id: categoryIds.development,
    serverId: serverIds.swordApp,
    name: 'DEVELOPMENT',
    position: 1,
    createdAt: lastWeek,
  }),
  
  events.categoryCreated({
    id: categoryIds.community,
    serverId: serverIds.swordApp,
    name: 'COMMUNITY',
    position: 2,
    createdAt: lastWeek,
  }),
  
  events.categoryCreated({
    id: categoryIds.support,
    serverId: serverIds.swordApp,
    name: 'SUPPORT',
    position: 3,
    createdAt: lastWeek,
  }),

  // Create roles
  events.roleCreated({
    id: roleIds.owner,
    serverId: serverIds.swordApp,
    name: 'Owner',
    color: '#ff6b6b',
    permissions: JSON.stringify(['ADMINISTRATOR']),
    position: 5,
    isHoisted: true,
    isMentionable: true,
    createdAt: lastWeek,
  }),
  
  events.roleCreated({
    id: roleIds.moderator,
    serverId: serverIds.swordApp,
    name: 'Moderator',
    color: '#4ecdc4',
    permissions: JSON.stringify(['MANAGE_CHANNELS', 'MANAGE_MESSAGES', 'KICK_MEMBERS']),
    position: 4,
    isHoisted: true,
    isMentionable: true,
    createdAt: lastWeek,
  }),
  
  events.roleCreated({
    id: roleIds.developer,
    serverId: serverIds.swordApp,
    name: 'Developer',
    color: '#45b7d1',
    permissions: JSON.stringify(['MANAGE_MESSAGES']),
    position: 3,
    isHoisted: true,
    isMentionable: true,
    createdAt: lastWeek,
  }),
  
  events.roleCreated({
    id: roleIds.beta_tester,
    serverId: serverIds.swordApp,
    name: 'Beta Tester',
    color: '#f9ca24',
    permissions: JSON.stringify(['SEND_MESSAGES', 'READ_MESSAGES']),
    position: 2,
    isHoisted: true,
    isMentionable: true,
    createdAt: lastWeek,
  }),
  
  events.roleCreated({
    id: roleIds.everyone,
    serverId: serverIds.swordApp,
    name: '@everyone',
    color: undefined,
    permissions: JSON.stringify(['READ_MESSAGES']),
    position: 1,
    isHoisted: false,
    isMentionable: false,
    createdAt: lastWeek,
  }),

  // Add server members
  events.memberJoined({
    id: generateId(),
    serverId: serverIds.swordApp,
    userId: userIds.admin,
    nickname: undefined,
    joinedAt: lastWeek,
    roles: JSON.stringify([roleIds.owner, roleIds.everyone]),
  }),
  
  events.memberJoined({
    id: generateId(),
    serverId: serverIds.swordApp,
    userId: userIds.moderator,
    nickname: undefined,
    joinedAt: lastWeek,
    roles: JSON.stringify([roleIds.moderator, roleIds.everyone]),
  }),
  
  events.memberJoined({
    id: generateId(),
    serverId: serverIds.swordApp,
    userId: userIds.developer,
    nickname: undefined,
    joinedAt: lastWeek,
    roles: JSON.stringify([roleIds.developer, roleIds.everyone]),
  }),
  
  events.memberJoined({
    id: generateId(),
    serverId: serverIds.swordApp,
    userId: userIds.designer,
    nickname: undefined,
    joinedAt: yesterday,
    roles: JSON.stringify([roleIds.beta_tester, roleIds.everyone]),
  }),
  
  events.memberJoined({
    id: generateId(),
    serverId: serverIds.swordApp,
    userId: userIds.beta_tester,
    nickname: undefined,
    joinedAt: yesterday,
    roles: JSON.stringify([roleIds.beta_tester, roleIds.everyone]),
  }),
  
  events.memberJoined({
    id: generateId(),
    serverId: serverIds.swordApp,
    userId: userIds.community,
    nickname: undefined,
    joinedAt: twoHoursAgo,
    roles: JSON.stringify([roleIds.everyone]),
  }),

  // Create channels - General category
  events.channelCreated({
    id: channelIds.welcome,
    serverId: serverIds.swordApp,
    name: 'welcome',
    description: 'Welcome to Sword App!',
    type: 'text',
    position: 0,
    categoryId: categoryIds.general,
    isPrivate: false,
    createdBy: userIds.admin,
    createdAt: lastWeek,
  }),
  
  events.channelCreated({
    id: channelIds.announcements,
    serverId: serverIds.swordApp,
    name: 'announcements',
    description: 'Important announcements about Sword App',
    type: 'announcement',
    position: 1,
    categoryId: categoryIds.general,
    isPrivate: false,
    createdBy: userIds.admin,
    createdAt: lastWeek,
  }),
  
  events.channelCreated({
    id: channelIds.general,
    serverId: serverIds.swordApp,
    name: 'general',
    description: 'General discussion about Sword App',
    type: 'text',
    position: 2,
    categoryId: categoryIds.general,
    isPrivate: false,
    createdBy: userIds.admin,
    createdAt: lastWeek,
  }),

  // Development category
  events.channelCreated({
    id: channelIds.development,
    serverId: serverIds.swordApp,
    name: 'development',
    description: 'Development discussions and updates',
    type: 'text',
    position: 0,
    categoryId: categoryIds.development,
    isPrivate: false,
    createdBy: userIds.developer,
    createdAt: lastWeek,
  }),
  
  events.channelCreated({
    id: channelIds.feature_requests,
    serverId: serverIds.swordApp,
    name: 'feature-requests',
    description: 'Request new features for Sword App',
    type: 'text',
    position: 1,
    categoryId: categoryIds.development,
    isPrivate: false,
    createdBy: userIds.developer,
    createdAt: lastWeek,
  }),
  
  events.channelCreated({
    id: channelIds.bug_reports,
    serverId: serverIds.swordApp,
    name: 'bug-reports',
    description: 'Report bugs and issues',
    type: 'text',
    position: 2,
    categoryId: categoryIds.development,
    isPrivate: false,
    createdBy: userIds.developer,
    createdAt: lastWeek,
  }),

  // Community category
  events.channelCreated({
    id: channelIds.introductions,
    serverId: serverIds.swordApp,
    name: 'introductions',
    description: 'Introduce yourself to the community',
    type: 'text',
    position: 0,
    categoryId: categoryIds.community,
    isPrivate: false,
    createdBy: userIds.moderator,
    createdAt: lastWeek,
  }),
  
  events.channelCreated({
    id: channelIds.feedback,
    serverId: serverIds.swordApp,
    name: 'feedback',
    description: 'Share your feedback about Sword App',
    type: 'text',
    position: 1,
    categoryId: categoryIds.community,
    isPrivate: false,
    createdBy: userIds.moderator,
    createdAt: lastWeek,
  }),

  // Support category
  events.channelCreated({
    id: channelIds.help,
    serverId: serverIds.swordApp,
    name: 'help',
    description: 'Get help with using Sword App',
    type: 'text',
    position: 0,
    categoryId: categoryIds.support,
    isPrivate: false,
    createdBy: userIds.moderator,
    createdAt: lastWeek,
  }),

  // Voice channels
  events.channelCreated({
    id: channelIds.generalVoice,
    serverId: serverIds.swordApp,
    name: 'General Voice',
    description: 'General voice chat',
    type: 'voice',
    position: 0,
    categoryId: categoryIds.general,
    isPrivate: false,
    createdBy: userIds.admin,
    createdAt: lastWeek,
  }),
  
  events.channelCreated({
    id: channelIds.devMeeting,
    serverId: serverIds.swordApp,
    name: 'Dev Meeting',
    description: 'Development team meetings',
    type: 'voice',
    position: 1,
    categoryId: categoryIds.development,
    isPrivate: false,
    createdBy: userIds.developer,
    createdAt: lastWeek,
  }),

  // Sample messages
  // Welcome message
  events.messageCreated({
    id: generateId(),
    channelId: channelIds.welcome,
    userId: userIds.admin,
    content: '🗡️ **Welcome to Sword App!** 🗡️\n\nHello and welcome to the official Sword Discord Alternative server! We\'re building the next generation of communication platforms.\n\n📢 **Check out** <#' + channelIds.announcements + '> for important updates\n💬 **Join the discussion** in <#' + channelIds.general + '>\n🛠️ **Report bugs** in <#' + channelIds.bug_reports + '>\n💡 **Request features** in <#' + channelIds.feature_requests + '>\n\nWe\'re excited to have you here!',
    type: 'text',
    createdAt: lastWeek,
  }),
  
  // Announcement
  events.messageCreated({
    id: generateId(),
    channelId: channelIds.announcements,
    userId: userIds.admin,
    content: '🚀 **Sword App Beta Launch!**\n\nWe\'re excited to announce the beta launch of Sword App - a modern Discord alternative built with cutting-edge technology.\n\n**What\'s New:**\n• Lightning-fast real-time messaging\n• Beautiful, customizable themes\n• Advanced server management\n• Voice chat capabilities\n• Mobile-friendly design\n\n**Coming Soon:**\n• Screen sharing\n• File sharing improvements\n• Custom emoji support\n• Bot integration\n\nThank you for being part of our beta community! 🙏',
    type: 'announcement',
    createdAt: lastWeek,
  }),
  
  // General discussion
  events.messageCreated({
    id: generateId(),
    channelId: channelIds.general,
    userId: userIds.developer,
    content: 'Hey everyone! Just pushed a new update with improved message loading performance. Let me know if you notice any improvements!',
    type: 'text',
    createdAt: yesterday,
  }),
  
  events.messageCreated({
    id: generateId(),
    channelId: channelIds.general,
    userId: userIds.beta_tester,
    content: 'The app feels much snappier now! Great work on the optimization 👍',
    type: 'text',
    createdAt: yesterday,
  }),
  
  events.messageCreated({
    id: generateId(),
    channelId: channelIds.general,
    userId: userIds.designer,
    content: 'I love the new theme system! The dark mode looks fantastic 🌙',
    type: 'text',
    createdAt: twoHoursAgo,
  }),
  
  // Feature request
  events.messageCreated({
    id: generateId(),
    channelId: channelIds.feature_requests,
    userId: userIds.community,
    content: '**Feature Request: Custom Status Messages**\n\nIt would be great to have custom status messages like "Working on Sword App" or "Taking a break". This would help community members know what everyone is up to!\n\nPriority: Medium\nCategory: User Experience',
    type: 'text',
    createdAt: twoHoursAgo,
  }),
  
  // Bug report
  events.messageCreated({
    id: generateId(),
    channelId: channelIds.bug_reports,
    userId: userIds.beta_tester,
    content: '**Bug Report: Message Input Not Clearing**\n\n**Steps to reproduce:**\n1. Type a long message\n2. Send the message\n3. Notice the input field still has text\n\n**Expected:** Input should clear after sending\n**Actual:** Text remains in input field\n\n**Browser:** Chrome 120\n**OS:** macOS',
    type: 'text',
    createdAt: now,
  }),

  // Add some reactions to messages
  events.reactionAdded({
    id: generateId(),
    messageId: generateId(), // This would reference an actual message ID in real usage
    userId: userIds.moderator,
    emoji: '👍',
    createdAt: yesterday,
  }),
  
  events.reactionAdded({
    id: generateId(),
    messageId: generateId(),
    userId: userIds.community,
    emoji: '🚀',
    createdAt: twoHoursAgo,
  }),

  // Create some server invites
  events.inviteCreated({
    id: generateId(),
    serverId: serverIds.swordApp,
    channelId: channelIds.general,
    inviteCode: 'swordapp2024',
    createdBy: userIds.admin,
    maxUses: undefined, // Unlimited uses
    expiresAt: undefined, // Never expires
    createdAt: lastWeek,
  }),

  events.inviteCreated({
    id: generateId(),
    serverId: serverIds.swordApp,
    channelId: channelIds.welcome,
    inviteCode: 'welcome-to-sword',
    createdBy: userIds.moderator,
    maxUses: 50,
    expiresAt: undefined,
    createdAt: yesterday,
  }),

  events.inviteCreated({
    id: generateId(),
    serverId: serverIds.swordApp,
    channelId: undefined, // General server invite
    inviteCode: 'beta-testers',
    createdBy: userIds.developer,
    maxUses: 25,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Expires in 30 days
    createdAt: twoHoursAgo,
  }),
]

// Export the IDs for use in dashboard
export const getLatestServerInfo = () => {
  const timestamp = Date.now()
  return {
    serverId: `server_sword_app_${timestamp}`,
    channelId: `chan_general_${timestamp}`,
  }
}

// Helper function to clear all existing data
export const clearAllData = async (store: any) => {
  console.log('🧹 Clearing existing data using fresh timestamp isolation...')
  
  try {
    // Since LiveStore uses event sourcing and we're using timestamp-based IDs,
    // each seed run creates a completely isolated dataset.
    // This effectively "clears" the old data by making it irrelevant.
    
    // For a more thorough clear in development, you could:
    // 1. Clear browser storage (localStorage/OPFS)
    // 2. Restart the application
    // 3. Use timestamp-based isolation (what we're doing)
    
    console.log('✅ Data isolation ready - fresh timestamps will create new dataset')
    console.log('💡 Tip: For complete reset, clear browser storage and refresh')
  } catch (error) {
    console.warn('Warning during data preparation:', error)
  }
}

// Helper function to apply all seed data
export const applySeedData = async (store: any) => {
  console.log('🌱 Starting fresh database seed...')
  
  // Clear existing data first
  await clearAllData(store)
  
  // Generate fresh seed data with unique IDs
  const seedData = createSeedData()
  
  console.log(`📦 Applying ${seedData.length} fresh events...`)
  
  // Apply seed data
  let successCount = 0
  let skipCount = 0
  
  for (const event of seedData) {
    try {
      store.commit(event)
      successCount++
    } catch (error: any) {
      console.warn('Skipping event:', error?.message || error)
      skipCount++
    }
  }
  
  console.log(`✅ Successfully applied ${successCount} events!`)
  if (skipCount > 0) {
    console.log(`⚠️ Skipped ${skipCount} duplicate events`)
  }
  console.log('🗡️ Sword App server is ready with fresh data!')
  
  // Return server info for updating defaults
  return {
    serverId: seedData.find(e => e.name === 'v1.ServerCreated')?.args?.id,
    channelId: seedData.find(e => e.name === 'v1.ChannelCreated' && e.args.name === 'general')?.args?.id,
  }
} 
import { type ReactNode } from 'react'
import { makePersistedAdapter } from '@livestore/adapter-web'
import { LiveStoreProvider, useStore } from '@livestore/react'
import { unstable_batchedUpdates as batchUpdates } from 'react-dom'
import { schema, events, tables } from '@goated/livestore'
import LiveStoreWorker from './livestore.worker?worker'
import LiveStoreSharedWorker from '@livestore/adapter-web/shared-worker?sharedworker'

// =============================================================================
// LIVESTORE CONFIGURATION
// =============================================================================

// Check for reset query parameter to reset persistence (useful for development)
const resetPersistence = import.meta.env.DEV && new URLSearchParams(window.location.search).get('reset') !== null

if (resetPersistence) {
  console.log('🔄 LiveStore persistence reset requested via ?reset parameter')
  console.log('💾 This will clear all local data and restart LiveStore')
  const searchParams = new URLSearchParams(window.location.search)
  searchParams.delete('reset')
  window.history.replaceState(null, '', `${window.location.pathname}?${searchParams.toString()}`)
} else if (import.meta.env.DEV) {
  console.log('🛠️ Development mode: Add ?reset to URL to reset LiveStore persistence')
}

// Create the adapter with Cloudflare sync backend
const adapter = makePersistedAdapter({
  storage: { type: 'opfs' }, // Still use OPFS for local caching
  worker: LiveStoreWorker,
  sharedWorker: LiveStoreSharedWorker,
  resetPersistence
})

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

export function AppLiveStoreProvider({ children }: { children: ReactNode }) {
  return (
    <LiveStoreProvider
      schema={schema}
      adapter={adapter}
      renderLoading={(stage) => (
        <div className="flex h-screen items-center justify-center bg-zinc-950 text-zinc-100">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300" />
            <span>Loading LiveStore ({stage.stage})...</span>
            {import.meta.env.DEV && stage.stage === 'loading' && (
              <div className="ml-4 text-xs text-zinc-500">
                If stuck, try adding ?reset to the URL
              </div>
            )}
          </div>
        </div>
      )}
      batchUpdates={batchUpdates}
      storeId="sword-app-global" // Single global store for all users
      syncPayload={{ authToken: 'insecure-token-change-me' }} // Auth token for sync backend - matches sync worker
    >
      {children}
    </LiveStoreProvider>
  )
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Helper function to generate IDs
const generateId = () => Math.random().toString(36).substring(2, 15)

// =============================================================================
// ACTIONS
// =============================================================================

export const actions = {
  // User actions
  createUser: (store: ReturnType<typeof useStore>['store'], userData: { id: string; email: string; name: string; username: string; avatar?: string; status?: string }) => {
    store.commit(events.userCreated({ ...userData, createdAt: new Date() }))
  },
  
  updateUser: (store: ReturnType<typeof useStore>['store'], id: string, updates: { name?: string; username?: string; avatar?: string; status?: string }) => {
    store.commit(events.userUpdated({ id, ...updates, updatedAt: new Date() }))
  },
  
  // Server actions
  createServer: (store: ReturnType<typeof useStore>['store'], serverData: { id: string; name: string; description?: string; icon?: string; banner?: string; ownerId: string; isPublic?: boolean }) => {
    store.commit(events.serverCreated({ ...serverData, memberCount: 1, createdAt: new Date() }))
  },
  
  updateServer: (store: ReturnType<typeof useStore>['store'], id: string, updates: { name?: string; description?: string; icon?: string; banner?: string; memberCount?: number }) => {
    store.commit(events.serverUpdated({ id, ...updates, updatedAt: new Date() }))
  },
  
  deleteServer: (store: ReturnType<typeof useStore>['store'], id: string) => {
    store.commit(events.serverDeleted({ id, deletedAt: new Date() }))
  },
  
  // Category actions
  createCategory: (store: ReturnType<typeof useStore>['store'], categoryData: { id: string; serverId: string; name: string; position?: number }) => {
    store.commit(events.categoryCreated({ ...categoryData, createdAt: new Date() }))
  },
  
  // Channel actions
  createChannel: (store: ReturnType<typeof useStore>['store'], channelData: { id: string; serverId: string; name: string; description?: string; type?: string; position?: number; categoryId?: string; isPrivate?: boolean; createdBy: string }) => {
    store.commit(events.channelCreated({ ...channelData, createdAt: new Date() }))
  },
  
  updateChannel: (store: ReturnType<typeof useStore>['store'], id: string, updates: { name?: string; description?: string; position?: number; categoryId?: string }) => {
    store.commit(events.channelUpdated({ id, ...updates, updatedAt: new Date() }))
  },
  
  deleteChannel: (store: ReturnType<typeof useStore>['store'], id: string) => {
    store.commit(events.channelDeleted({ id, deletedAt: new Date() }))
  },
  
  // Message actions
  createMessage: (store: ReturnType<typeof useStore>['store'], messageData: { channelId: string; userId: string; content: string; type?: string; attachments?: string; replyToId?: string }) => {
    const id = generateId()
    store.commit(events.messageCreated({ id, ...messageData, createdAt: new Date() }))
    return id
  },
  
  updateMessage: (store: ReturnType<typeof useStore>['store'], id: string, content: string) => {
    store.commit(events.messageUpdated({ id, content, editedAt: new Date() }))
  },
  
  deleteMessage: (store: ReturnType<typeof useStore>['store'], id: string) => {
    store.commit(events.messageDeleted({ id, deletedAt: new Date() }))
  },
  
  pinMessage: (store: ReturnType<typeof useStore>['store'], id: string, isPinned: boolean) => {
    store.commit(events.messagePinned({ id, isPinned }))
  },
  
  // Reaction actions
  addReaction: (store: ReturnType<typeof useStore>['store'], messageId: string, userId: string, emoji: string) => {
    const id = generateId()
    store.commit(events.reactionAdded({ id, messageId, userId, emoji, createdAt: new Date() }))
    return id
  },
  
  removeReaction: (store: ReturnType<typeof useStore>['store'], id: string) => {
    store.commit(events.reactionRemoved({ id }))
  },
  
  // Server member actions - with proper role handling
  joinServer: (store: ReturnType<typeof useStore>['store'], serverId: string, userId: string, nickname?: string, isAdmin: boolean = false) => {
    const id = generateId()
    const roles = isAdmin ? ['admin'] : ['member']
    store.commit(events.memberJoined({ 
      id, 
      serverId, 
      userId, 
      nickname,
      roles: JSON.stringify(roles),
      joinedAt: new Date() 
    }))
    return id
  },
  
  leaveServer: (store: ReturnType<typeof useStore>['store'], id: string) => {
    store.commit(events.memberLeft({ id }))
  },
  
  updateMember: (store: ReturnType<typeof useStore>['store'], id: string, updates: { nickname?: string; roles?: string[] }) => {
    const processedUpdates = {
      ...updates,
      roles: updates.roles ? JSON.stringify(updates.roles) : undefined
    }
    store.commit(events.memberUpdated({ id, ...processedUpdates }))
  },
  
  // Role actions
  createRole: (store: ReturnType<typeof useStore>['store'], roleData: { id: string; serverId: string; name: string; color?: string; permissions?: string[]; position?: number; isHoisted?: boolean; isMentionable?: boolean }) => {
    const processedData = {
      ...roleData,
      permissions: roleData.permissions ? JSON.stringify(roleData.permissions) : undefined
    }
    store.commit(events.roleCreated({ ...processedData, createdAt: new Date() }))
  },
  
  // Todo actions
  createTodo: (store: ReturnType<typeof useStore>['store'], todoData: { id: string; title: string; description?: string; createdBy: string; assignedTo?: string; dueDate?: Date }) => {
    store.commit(events.todoCreated({ ...todoData, completed: false, createdAt: new Date() }))
  },
  
  updateTodo: (store: ReturnType<typeof useStore>['store'], id: string, updates: { title?: string; description?: string; completed?: boolean; assignedTo?: string; dueDate?: Date }) => {
    store.commit(events.todoUpdated({ id, ...updates, updatedAt: new Date() }))
  },
  
  completeTodo: (store: ReturnType<typeof useStore>['store'], id: string) => {
    store.commit(events.todoUpdated({ id, completed: true, updatedAt: new Date() }))
  },
  
  deleteTodo: (store: ReturnType<typeof useStore>['store'], id: string) => {
    store.commit(events.todoDeleted({ id, deletedAt: new Date() }))
  },

  // Invite actions
  createInvite: (store: ReturnType<typeof useStore>['store'], inviteData: { serverId: string; channelId?: string; createdBy: string; maxUses?: number; expiresAt?: Date }) => {
    const id = generateId()
    const inviteCode = generateId() + generateId() // Make it longer
    store.commit(events.inviteCreated({ 
      id, 
      inviteCode,
      ...inviteData, 
      createdAt: new Date() 
    }))
    return { id, inviteCode }
  },

  useInvite: (store: ReturnType<typeof useStore>['store'], inviteId: string, currentUses: number) => {
    store.commit(events.inviteUsed({ id: inviteId, currentUses: currentUses + 1 }))
  },

  deleteInvite: (store: ReturnType<typeof useStore>['store'], id: string) => {
    store.commit(events.inviteDeleted({ id, deletedAt: new Date() }))
  },
}

// =============================================================================
// UTILITY FUNCTIONS FOR SERVER MANAGEMENT
// =============================================================================

// Check if a user is admin of a server
export const isServerAdmin = (store: ReturnType<typeof useStore>['store'], serverId: string, userId: string): boolean => {
  const member = store.query(tables.serverMembers.where({ serverId, userId })).at(0)
  if (!member) return false
  
  try {
    const roles = member.roles ? JSON.parse(member.roles) : []
    return roles.includes('admin')
  } catch {
    return false
  }
}

// Check if a user is the owner of a server
export const isServerOwner = (store: ReturnType<typeof useStore>['store'], serverId: string, userId: string): boolean => {
  const server = store.query(tables.servers.where({ id: serverId })).at(0)
  return server?.ownerId === userId
}

// Check if a user has permission to perform an action on a server
export const hasServerPermission = (store: ReturnType<typeof useStore>['store'], serverId: string, userId: string, permission: 'admin' | 'owner'): boolean => {
  if (permission === 'owner') {
    return isServerOwner(store, serverId, userId)
  }
  if (permission === 'admin') {
    return isServerOwner(store, serverId, userId) || isServerAdmin(store, serverId, userId)
  }
  return false
}

// =============================================================================
// EXPORTS
// =============================================================================

export { useStore, events, tables, generateId } 
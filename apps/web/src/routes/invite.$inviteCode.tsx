import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { useEffect, useState } from 'react';
import { useStore, tables, actions } from '@/lib/livestore';
import { queryDb } from '@livestore/livestore';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/invite/$inviteCode')({
  component: InviteComponent,
});

function InviteComponent() {
  const { inviteCode } = Route.useParams();
  const navigate = useNavigate();
  const { store } = useStore();
  const { data: session, isPending } = authClient.useSession();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isJoining, setIsJoining] = useState(false);

  // Query for the invite
  const inviteQuery = queryDb(() =>
    tables.invites.where({
      inviteCode: inviteCode,
      deletedAt: null,
    })
  );
  const invites = store.useQuery(inviteQuery) ?? [];
  const invite = invites[0];

  // Query for server details
  const serverQuery = queryDb(() => {
    if (!invite?.serverId) {
      return tables.servers.where({ id: 'never-matches' });
    }
    return tables.servers.where({
      id: invite.serverId,
      deletedAt: null,
    });
  });
  const servers = store.useQuery(serverQuery) ?? [];
  const server = servers[0];

  // Query for current user
  const usersQuery = queryDb(() =>
    tables.users.where({ deletedAt: null })
  );
  const users = store.useQuery(usersQuery) ?? [];
  
  // Ensure current user exists in LiveStore and return it
  const getCurrentUser = () => {
    if (!session?.user) return null
    
    // Create a consistent user ID based on session
    const sessionUserId = `user_${session.user.email?.replace(/[^a-zA-Z0-9]/g, '_')}_${session.user.id || Date.now()}`
    
    // Check if user already exists in LiveStore
    let currentUser = users.find((user: any) => 
      user.email === session.user.email || user.id === sessionUserId
    )
    
    // If user doesn't exist, create them
    if (!currentUser && session.user.email) {
      const userData = {
        id: sessionUserId,
        email: session.user.email,
        name: session.user.name || session.user.email,
        username: session.user.name?.replace(/\s+/g, '') || session.user.email.split('@')[0],
        avatar: session.user.image || undefined,
        status: 'online'
      }
      
      try {
        actions.createUser(store, userData)
        console.log('Created new user in LiveStore for invite redemption:', userData)
        
        // Return the user data immediately (it will be persisted)
        return userData
      } catch (error) {
        console.warn('User might already exist:', error)
        // Try to find the user again after creation attempt
        currentUser = users.find((user: any) => 
          user.email === session.user.email || user.id === sessionUserId
        )
      }
    }
    
    // Update user info if it has changed
    if (currentUser && session.user) {
      const updates: any = {}
      let hasUpdates = false
      
      if (session.user.name && currentUser.name !== session.user.name) {
        updates.name = session.user.name
        hasUpdates = true
      }
      if (session.user.image && currentUser.avatar !== session.user.image) {
        updates.avatar = session.user.image
        hasUpdates = true
      }
      
      if (hasUpdates) {
        actions.updateUser(store, currentUser.id, updates)
        console.log('Updated user info for invite redemption:', updates)
      }
    }
    
    return currentUser || null
  }

  const currentUser = getCurrentUser()

  // Query for server members to check if user is already a member
  const membersQuery = queryDb(() => {
    if (!invite?.serverId || !currentUser?.id) {
      return tables.serverMembers.where({ id: 'never-matches' });
    }
    return tables.serverMembers.where({
      serverId: invite.serverId,
      userId: currentUser.id,
    });
  });
  const members = store.useQuery(membersQuery) ?? [];
  const isAlreadyMember = members.length > 0;

  useEffect(() => {
    if (!isPending) {
      setIsLoading(false);
    }
  }, [isPending]);

  useEffect(() => {
    // Check if invite is valid
    if (!isLoading && invites.length > 0) {
      const invite = invites[0];
      
      // Check if invite is expired
      if (invite.expiresAt && new Date(invite.expiresAt) < new Date()) {
        setError('This invite has expired.');
        return;
      }

      // Check if invite has reached max uses
      if (invite.maxUses && invite.currentUses >= invite.maxUses) {
        setError('This invite has reached its maximum number of uses.');
        return;
      }
    } else if (!isLoading && invites.length === 0) {
      setError('Invalid or expired invite link.');
    }
  }, [invite, isLoading, invites]);

  const handleJoinServer = async () => {
    if (!session?.user) {
      navigate({ to: '/login' });
      return;
    }

    const currentUser = getCurrentUser()
    
    // Debug logging
    console.log('Join attempt debug:', {
      currentUser: currentUser ? 'Found' : 'Missing',
      invite: invite ? 'Found' : 'Missing', 
      server: server ? 'Found' : 'Missing',
      inviteData: invite,
      serverData: server,
      userData: currentUser
    })

    if (!currentUser) {
      setError('Unable to create or find user account. Please try refreshing the page.');
      return;
    }
    
    if (!invite) {
      setError('Invite not found. The link may be invalid or expired.');
      return;
    }
    
    if (!server) {
      setError('Server not found. You may need to seed the database first by visiting /test');
      return;
    }

    setIsJoining(true);

    try {
      // Join the server as a regular member (not admin)
      actions.joinServer(store, invite.serverId, currentUser.id, undefined, false);

      // Update invite usage count
      actions.useInvite(store, invite.id, invite.currentUses);

      console.log('✅ Successfully joined server as member');

      // Navigate to the server
      navigate({ to: '/dashboard' });
    } catch (error) {
      console.error('Error joining server:', error);
      setError('Failed to join server. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-zinc-300 mx-auto mb-4" />
          <p className="text-zinc-300">Loading invite...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6 bg-zinc-900 rounded-lg border border-zinc-800">
          <h1 className="text-2xl font-bold text-zinc-100 mb-4">Join Server</h1>
          {server && (
            <div className="mb-6">
              <p className="text-zinc-300">You've been invited to join:</p>
              <h2 className="text-xl font-semibold text-zinc-100 mt-2">{server.name}</h2>
              {server.description && (
                <p className="text-zinc-400 text-sm mt-1">{server.description}</p>
              )}
            </div>
          )}
          <p className="text-zinc-400 mb-6">You need to sign in to join this server.</p>
          <button
            onClick={() => navigate({ to: '/login' })}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6 bg-zinc-900 rounded-lg border border-zinc-800">
          <h1 className="text-2xl font-bold text-red-400 mb-4">Invalid Invite</h1>
          <p className="text-zinc-300 mb-6">{error}</p>
          <button
            onClick={() => navigate({ to: '/dashboard' })}
            className="w-full bg-zinc-700 hover:bg-zinc-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (isAlreadyMember) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center p-6 bg-zinc-900 rounded-lg border border-zinc-800">
          <h1 className="text-2xl font-bold text-green-400 mb-4">Already a Member</h1>
          <div className="mb-6">
            <p className="text-zinc-300">You're already a member of:</p>
            <h2 className="text-xl font-semibold text-zinc-100 mt-2">{server?.name}</h2>
          </div>
          <button
            onClick={() => navigate({ to: '/dashboard' })}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Go to Server
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center p-6 bg-zinc-900 rounded-lg border border-zinc-800">
        <h1 className="text-2xl font-bold text-zinc-100 mb-4">Join Server</h1>
        
        {server && (
          <div className="mb-6">
            <div className="w-16 h-16 bg-zinc-700 rounded-lg mx-auto mb-4 flex items-center justify-center">
              {server.icon ? (
                <img src={server.icon} alt={server.name} className="w-full h-full rounded-lg object-cover" />
              ) : (
                <span className="text-2xl font-bold text-zinc-300">
                  {server.name.charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            
            <h2 className="text-xl font-semibold text-zinc-100">{server.name}</h2>
            {server.description && (
              <p className="text-zinc-400 text-sm mt-2">{server.description}</p>
            )}
            
            <div className="flex items-center justify-center gap-4 mt-4 text-sm text-zinc-500">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{server.memberCount || 0} members</span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={handleJoinServer}
          disabled={isJoining}
          className={cn(
            "w-full font-medium py-3 px-4 rounded-lg transition-colors",
            isJoining
              ? "bg-zinc-700 text-zinc-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700 text-white"
          )}
        >
          {isJoining ? 'Joining...' : `Join ${server?.name || 'Server'}`}
        </button>

        <button
          onClick={() => navigate({ to: '/dashboard' })}
          className="w-full mt-3 bg-zinc-700 hover:bg-zinc-600 text-zinc-300 font-medium py-2 px-4 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  );
} 
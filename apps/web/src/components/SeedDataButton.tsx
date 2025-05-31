import { useState } from 'react'
import { useStore } from '@livestore/react'
import { seedDatabase } from '@/utils/seed-database'
import { Button } from './ui/button'

export function SeedDataButton() {
  const { store } = useStore()
  const [isSeeding, setIsSeeding] = useState(false)
  const [isSeeded, setIsSeeded] = useState(false)
  const [lastSeedTime, setLastSeedTime] = useState<string>('')
  const [serverInfo, setServerInfo] = useState<{serverId?: string, channelId?: string}>({})

  const handleSeed = async () => {
    setIsSeeding(true)
    try {
      console.log('🌐 Creating global server in Cloudflare...')
      const result = await seedDatabase(store)
      
      setServerInfo(result)
      setIsSeeded(true)
      setLastSeedTime(new Date().toLocaleTimeString())
      
      console.log('✅ Global server created successfully!')
      console.log('🏰 Server created:', result.serverId)
      console.log('💬 Default channel:', result.channelId)
      
      // Show success message with invite info
      alert(`✅ Sword App server created in Cloudflare database!

🌐 Global Server: Available to ALL users worldwide
🏰 Server: Sword App
💬 Channels: Welcome, General, Development, etc.
🎫 Invite codes: swordapp2024, welcome-to-sword, beta-testers

You've been automatically added as a member!
Share invite codes for others to join from any device/browser.`)
      
    } catch (error) {
      console.error('❌ Failed to create global server:', error)
      alert('❌ Failed to create server. Check console for details.')
    } finally {
      setIsSeeding(false)
    }
  }

  const handleReset = () => {
    setIsSeeded(false)
    setLastSeedTime('')
    setServerInfo({})
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleSeed}
        disabled={isSeeding}
        className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-medium"
      >
        {isSeeding ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Creating Global Server...
          </div>
        ) : (
          '🌐 Create Global Sword App Server'
        )}
      </Button>

      {isSeeded && (
        <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-emerald-800">
              ✅ Global Server Created
            </span>
            <button
              type="button"
              onClick={handleReset}
              className="rounded bg-emerald-600 px-2 py-1 text-white text-xs hover:bg-emerald-700"
            >
              Reset
            </button>
          </div>
          
          <div className="text-xs text-emerald-700 space-y-1">
            <div><strong>Time:</strong> {lastSeedTime}</div>
            <div><strong>Database:</strong> Cloudflare D1 (Global)</div>
            {serverInfo.serverId && (
              <div><strong>Server ID:</strong> <code className="bg-emerald-100 px-1 rounded">{serverInfo.serverId.substring(0, 20)}...</code></div>
            )}
            <div><strong>Status:</strong> You're auto-joined as a member</div>
            <div><strong>Global Invites:</strong> swordapp2024, welcome-to-sword, beta-testers</div>
          </div>
          
          <div className="mt-2 pt-2 border-t border-emerald-200">
            <a 
              href="/dashboard" 
              className="text-xs text-emerald-600 hover:text-emerald-800 font-medium"
            >
              → Go to Dashboard to start chatting
            </a>
          </div>
        </div>
      )}
    </div>
  )
} 
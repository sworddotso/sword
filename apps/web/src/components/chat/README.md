# Chat Components

This directory contains a modular, themeable chat interface system built with React and TypeScript. The components are designed to be reusable, customizable, and maintainable, supporting Discord-like chat functionality.

## Overview

The chat system is broken down into several key areas:

- **Theme System**: Centralized theming with customizable variants (default, light, discord)
- **Server Management**: Server sidebar with server selection
- **Channel Management**: Channel organization with text and voice channels
- **Messaging**: Chat area with message display and input
- **User Interface**: User controls and status display

## Component Structure

```
chat/
├── index.ts                        # Export all components
├── chat-theme-provider.tsx         # Theme context and provider
├── chat-theme-customizer.tsx       # Theme customization demo
├── server-sidebar.tsx              # Main server navigation
├── server-item.tsx                 # Individual server button
├── add-server-button.tsx           # Add server functionality
├── channel-sidebar.tsx             # Channel navigation
├── channel-section.tsx             # Collapsible channel groups
├── channel-item.tsx               # Individual channel items
├── chat-area.tsx                   # Main chat interface
├── message-list.tsx               # Message display area
├── message-input.tsx              # Message composition
├── message-item.tsx               # Individual message display
├── top-bar.tsx                    # Channel header
├── user-bar.tsx                   # User status and controls
├── server-header.tsx              # Server dropdown header
└── README.md                      # This documentation
```

## Theme System

### Theme Structure

The chat theme system is defined in `src/lib/theme.ts` and includes comprehensive styling for all chat components:

```typescript
interface ChatTheme {
  layout: { background: string; containerBackground: string; };
  serverSidebar: {
    background: string;
    serverItem: { size: string; borderRadius: string; /* ... */ };
    tooltip: { background: string; color: string; border: string; };
    addButton: { background: string; hoverBackground: string; /* ... */ };
  };
  channelSidebar: {
    background: string; border: string; borderRadius: string;
    section: { titleColor: string; titleHoverColor: string; titleSize: string; };
    channel: { background: string; hoverBackground: string; /* ... */ };
    notification: { background: string; color: string; size: string; };
  };
  chatArea: {
    background: string; borderRadius: string;
    topBar: { background: string; borderBottom: string; /* ... */ };
    messageArea: { background: string; padding: string; };
    message: { padding: string; hoverBackground: string; /* ... */ };
    inputArea: { background: string; border: string; /* ... */ };
  };
  userBar: {
    background: string; borderTop: string; padding: string;
    avatar: { size: string; borderRadius: string; };
    username: { color: string; size: string; weight: string; };
    /* ... */
  };
  scrollbar: { track: string; thumb: string; thumbHover: string; };
}
```

### Theme Variants

Three predefined variants are available:

1. **Default**: Dark zinc-based theme (Discord-like)
2. **Light**: Light theme with white backgrounds
3. **Discord**: Authentic Discord color scheme

### Using the Theme System

```tsx
import { ChatThemeProvider, useChatTheme } from '@/components/chat';

// Wrap your chat components
<ChatThemeProvider initialVariant="default">
  <YourChatComponents />
</ChatThemeProvider>

// Use the theme in components
const { theme, setVariant, customizeTheme } = useChatTheme();
```

### Customizing Themes

```tsx
// Change theme variant
setVariant('light');

// Apply custom styling (deep partial support)
customizeTheme({
  serverSidebar: {
    serverItem: {
      selectedRing: "ring-2 ring-purple-500 ring-offset-2 ring-offset-zinc-900",
    },
  },
  channelSidebar: {
    channel: {
      selectedBackground: "bg-purple-800",
      selectedColor: "text-purple-100",
    },
  },
});
```

## Component Usage

### Basic Chat Setup

```tsx
import {
  ChatThemeProvider,
  ServerSidebar,
  ChannelSidebar,
  ChatArea,
  TopBar,
} from '@/components/chat';

function ChatInterface() {
  const [selectedServer, setSelectedServer] = useState("default");
  const [selectedChannel, setSelectedChannel] = useState("general");

  return (
    <ChatThemeProvider>
      <div className="h-screen flex">
        <ServerSidebar
          selectedServer={selectedServer}
          onServerSelect={setSelectedServer}
        />
        
        <ChannelSidebar
          selectedChannel={selectedChannel}
          onChannelSelect={setSelectedChannel}
          serverName="My Server"
          selectedServer={selectedServer}
          userName="John Doe"
        />
        
        <div className="flex-1 flex flex-col">
          <TopBar selectedChannel={selectedChannel} />
          <ChatArea selectedChannel={selectedChannel} />
        </div>
      </div>
    </ChatThemeProvider>
  );
}
```

### Server Management

```tsx
// Server sidebar with custom servers
const servers = [
  { id: "server1", name: "Gaming", image: "/server1.png", color: "bg-blue-500" },
  { id: "server2", name: "Work", image: "/server2.png", color: "bg-green-500" },
];

<ServerSidebar
  selectedServer={selectedServer}
  onServerSelect={setSelectedServer}
  onAddServer={() => console.log("Add server")}
/>
```

### Channel Management

```tsx
// Channel sidebar with sections
const textChannels = [
  { name: "general", notifications: 0 },
  { name: "random", notifications: 3 },
];

const voiceChannels = [
  { name: "General Voice", userCount: 5 },
  { name: "Music Room", userCount: 2 },
];

<ChannelSection
  title="Text Channels"
  type="text"
  channels={textChannels}
  selectedChannel={selectedChannel}
  onChannelSelect={setSelectedChannel}
  onAddChannel={() => console.log("Add channel")}
/>
```

### Message System

```tsx
// Custom message handling
<MessageInput
  selectedChannel={selectedChannel}
  onSendMessage={(message) => {
    // Send to your backend
    console.log("Sending:", message);
  }}
  placeholder="Type your message..."
/>

// Custom message display
<MessageList
  messages={messages}
  className="custom-message-list"
/>
```

## Customization Examples

### Creating a Gaming Theme

```tsx
const applyGamingTheme = () => {
  customizeTheme({
    layout: {
      background: "bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900",
    },
    serverSidebar: {
      background: "bg-black/50",
      serverItem: {
        selectedRing: "ring-2 ring-purple-400 ring-offset-2 ring-offset-black shadow-lg shadow-purple-400/50",
        hoverRing: "ring-2 ring-purple-300 ring-offset-2 ring-offset-black",
      },
    },
    channelSidebar: {
      background: "bg-purple-950/30 backdrop-blur-sm",
      channel: {
        selectedBackground: "bg-purple-800/50",
        selectedColor: "text-purple-100",
      },
    },
    chatArea: {
      background: "bg-black/30 backdrop-blur-sm",
      topBar: {
        background: "bg-purple-950/50 backdrop-blur-sm border-b border-purple-500/30",
        color: "text-purple-100",
      },
    },
  });
};
```

### Creating a Professional Theme

```tsx
const applyProfessionalTheme = () => {
  customizeTheme({
    layout: {
      background: "bg-slate-50",
    },
    serverSidebar: {
      background: "bg-white shadow-lg",
      serverItem: {
        selectedRing: "ring-2 ring-blue-500 ring-offset-2 ring-offset-white",
        background: "bg-slate-100",
        hoverBackground: "hover:bg-slate-200",
      },
    },
    channelSidebar: {
      background: "bg-white",
      border: "border-r border-slate-200",
      channel: {
        selectedBackground: "bg-blue-50",
        selectedColor: "text-blue-700",
        hoverBackground: "hover:bg-slate-50",
      },
    },
    chatArea: {
      background: "bg-white",
      topBar: {
        background: "bg-slate-50",
        borderBottom: "border-b border-slate-200",
        color: "text-slate-900",
      },
    },
    userBar: {
      background: "bg-slate-50",
      borderTop: "border-t border-slate-200",
    },
  });
};
```

## Best Practices

1. **Component Composition**: Use the provided components as building blocks
2. **Theme Consistency**: Stick to the theme system for consistent styling
3. **Accessibility**: All components include proper ARIA attributes and keyboard navigation
4. **Responsive Design**: Components are mobile-first and responsive
5. **Type Safety**: Leverage TypeScript for better development experience
6. **Performance**: Components are optimized with proper memoization and lazy loading

## Adding New Components

When creating new chat components:

1. Follow the existing naming convention (`PascalCase`)
2. Use the `useChatTheme` hook for styling
3. Accept a `className` prop for additional customization
4. Export from `index.ts`
5. Update this README with usage examples
6. Ensure proper TypeScript types

## Layout Integration

### With Resizable Panels

```tsx
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";

<ResizablePanelGroup direction="horizontal" className="h-full">
  <ResizablePanel defaultSize={25} minSize={15} maxSize={35}>
    <ChannelSidebar {...props} />
  </ResizablePanel>
  
  <ResizableHandle withHandle />
  
  <ResizablePanel defaultSize={75} minSize={65}>
    <div className="h-full flex flex-col">
      <TopBar selectedChannel={selectedChannel} />
      <ChatArea selectedChannel={selectedChannel} />
    </div>
  </ResizablePanel>
</ResizablePanelGroup>
```

### Mobile Responsive

The components automatically adapt to mobile screens with:
- Collapsible sidebars
- Responsive spacing and typography
- Touch-friendly interactive elements
- Optimized layouts for small screens

## Integration with Backend

### Message Handling

```tsx
// Real-time message updates
useEffect(() => {
  const socket = io('your-backend-url');
  
  socket.on('message', (message) => {
    setMessages(prev => [...prev, message]);
  });
  
  return () => socket.disconnect();
}, []);

// Sending messages
const handleSendMessage = async (content: string) => {
  const message = {
    content,
    channelId: selectedChannel,
    userId: user.id,
  };
  
  await fetch('/api/messages', {
    method: 'POST',
    body: JSON.stringify(message),
  });
};
```

### Server Management

```tsx
// Dynamic server loading
const { data: servers } = useQuery('servers', fetchUserServers);
const { data: channels } = useQuery(['channels', selectedServer], 
  () => fetchServerChannels(selectedServer)
);
```

This modular approach makes the chat system highly customizable while maintaining consistency and type safety. The theme system allows for easy branding and user preference support. 
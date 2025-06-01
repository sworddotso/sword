# Architecture Overview

This document explains the complete architecture of the LiveStore synchronization system.

## 🏗️ High-Level Architecture

```mermaid
graph TB
    subgraph "Client Browser"
        A[React Application] --> B[LiveStore Provider]
        B --> C[Main Thread Store]
        C --> D[Web Worker]
        D --> E[Shared Worker]
        E --> F[OPFS SQLite Database]
    end
    
    subgraph "Cloudflare Edge"
        G[Worker Script] --> H[Durable Object Instance]
        H --> I[WebSocket Handler]
        H --> J[Event Processor]
        J --> K[D1 SQLite Database]
    end
    
    subgraph "Data Flow"
        L[Event Log] --> M[State Materialization]
        M --> N[Reactive Queries]
    end
    
    E -->|WebSocket Connection| I
    F -->|Local Events| D
    K -->|Remote Events| J
    J -->|Event Sync| E
    
    style A fill:#e1f5fe
    style H fill:#fff3e0
    style F fill:#f3e5f5
    style K fill:#e8f5e8
```

## 🔄 Data Flow Architecture

```mermaid
sequenceDiagram
    participant UI as React UI
    participant Store as LiveStore
    participant Worker as Web Worker
    participant Shared as Shared Worker
    participant CF as Cloudflare Worker
    participant DO as Durable Object
    participant DB as D1 Database
    
    Note over UI,DB: User Action (e.g., Send Message)
    
    UI->>Store: Commit Event
    Store->>Worker: Process Event
    Worker->>Shared: Store Locally
    Shared->>CF: Sync Event (WebSocket)
    CF->>DO: Handle Push Request
    DO->>DB: Persist Event
    DB-->>DO: Acknowledge
    DO-->>CF: Success Response
    CF-->>Shared: Sync Confirmation
    
    Note over UI,DB: Other Client Sync
    
    DO->>CF: Broadcast to Other Clients
    CF->>Shared: Push New Events
    Shared->>Worker: Apply Remote Events
    Worker->>Store: Update State
    Store->>UI: Reactive Update
```

## 🧩 Component Breakdown

### Frontend Architecture

```mermaid
graph LR
    subgraph "Main Thread"
        A[React Components] --> B[LiveStore Provider]
        B --> C[Store Instance]
        C --> D[Query Results]
        D --> A
    end
    
    subgraph "Web Worker"
        E[Event Processor] --> F[State Engine]
        F --> G[SQLite Interface]
    end
    
    subgraph "Shared Worker"
        H[Connection Manager] --> I[Sync Protocol]
        I --> J[WebSocket Client]
        I --> K[Local Persistence]
    end
    
    C <--> E
    E <--> H
    
    style A fill:#bbdefb
    style E fill:#c8e6c9
    style H fill:#ffe0b2
```

### Backend Architecture

```mermaid
graph TB
    subgraph "Cloudflare Worker"
        A[Request Router] --> B[WebSocket Upgrade]
        A --> C[HTTP Handler]
        B --> D[Durable Object Binding]
    end
    
    subgraph "Durable Object Class"
        E[WebSocket Manager] --> F[Connection Registry]
        E --> G[Message Handler]
        G --> H[Event Validator]
        H --> I[Database Writer]
        G --> J[Event Broadcaster]
    end
    
    subgraph "D1 Database"
        K[Event Tables] --> L[Store Instances]
        L --> M[Event Logs]
    end
    
    D --> E
    I --> K
    
    style A fill:#fff3e0
    style E fill:#ffebee
    style K fill:#e8f5e8
```

## 📊 Data Architecture

### Event Sourcing Model

```mermaid
graph TD
    A[User Action] --> B[Event Created]
    B --> C[Event Validated]
    C --> D[Event Stored Locally]
    C --> E[Event Sent to Server]
    
    D --> F[Local State Updated]
    E --> G[Server Validates]
    G --> H[Event Persisted in D1]
    H --> I[Event Broadcast to Clients]
    
    I --> J[Clients Receive Event]
    J --> K[Client State Updated]
    
    style B fill:#e3f2fd
    style H fill:#f3e5f5
    style K fill:#e8f5e8
```

### Database Schema

```mermaid
erDiagram
    EVENT_LOG {
        string id PK
        string storeId
        string eventType
        json payload
        timestamp createdAt
        string clientId
        number sequence
    }
    
    STORE_METADATA {
        string storeId PK
        timestamp lastSyncAt
        number eventCount
        string version
    }
    
    CLIENT_SESSIONS {
        string sessionId PK
        string storeId FK
        timestamp connectedAt
        string status
    }
    
    EVENT_LOG ||--o{ STORE_METADATA : belongs_to
    CLIENT_SESSIONS ||--o{ STORE_METADATA : connects_to
```

## 🔧 Sync Protocol

### Connection Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Disconnected
    Disconnected --> Connecting : initiate_connection()
    Connecting --> Connected : websocket_open()
    Connecting --> Disconnected : connection_failed()
    
    Connected --> Authenticating : send_auth()
    Authenticating --> Authenticated : auth_success()
    Authenticating --> Disconnected : auth_failed()
    
    Authenticated --> Syncing : start_sync()
    Syncing --> Synced : sync_complete()
    Synced --> Syncing : new_events()
    
    Synced --> Disconnected : connection_lost()
    Syncing --> Disconnected : sync_error()
    Disconnected --> [*] : cleanup()
```

### Message Protocol

```mermaid
graph TD
    A[Client Message] --> B{Message Type}
    
    B --> C[PUSH Event]
    B --> D[PULL Request]
    B --> E[AUTH Token]
    
    C --> F[Validate Event]
    F --> G[Store in D1]
    G --> H[Broadcast to Clients]
    
    D --> I[Query D1 for New Events]
    I --> J[Send Event Batch]
    
    E --> K[Validate Token]
    K --> L[Establish Session]
    
    style C fill:#e8f5e8
    style D fill:#e3f2fd
    style E fill:#fff3e0
```

## 🌐 Network Architecture

### Global Distribution

```mermaid
graph TB
    subgraph "Client Regions"
        A[US East] --> D[Cloudflare Edge]
        B[EU West] --> D
        C[Asia Pacific] --> D
    end
    
    subgraph "Cloudflare Edge Network"
        D --> E[Load Balancer]
        E --> F[Worker Instances]
        F --> G[Durable Object]
    end
    
    subgraph "Data Layer"
        G --> H[D1 Primary]
        H --> I[D1 Replicas]
    end
    
    style D fill:#ff9800
    style G fill:#4caf50
    style H fill:#2196f3
```

## 🔐 Security Architecture

```mermaid
graph TD
    A[Client Request] --> B[TLS Termination]
    B --> C[Auth Token Validation]
    C --> D[Rate Limiting]
    D --> E[Input Validation]
    E --> F[Business Logic]
    
    F --> G[Database Queries]
    G --> H[Response Sanitization]
    H --> I[Encrypted Response]
    
    style C fill:#ffebee
    style E fill:#fff3e0
    style I fill:#e8f5e8
```

## 📈 Scalability Considerations

### Horizontal Scaling

```mermaid
graph LR
    subgraph "Multiple Store Instances"
        A[Store A] --> D[Durable Object A]
        B[Store B] --> E[Durable Object B]
        C[Store N] --> F[Durable Object N]
    end
    
    subgraph "Shared Infrastructure"
        G[D1 Database]
        H[Worker Pool]
    end
    
    D --> G
    E --> G
    F --> G
    
    H --> D
    H --> E
    H --> F
```

### Performance Optimization

- **Connection Pooling**: Shared workers manage WebSocket connections
- **Event Batching**: Multiple events sent together to reduce network calls
- **Local Caching**: OPFS provides fast local storage with no network latency
- **Edge Computing**: Cloudflare's global network reduces RTT
- **Efficient Queries**: SQLite materialized views for fast data access

---

This architecture provides a robust, scalable, and real-time synchronization system that works across multiple clients while maintaining data consistency and offline capabilities. 
# Sword

**Open-source communication platform. Privacy-focused. Community-driven.**

Sword is a modern, privacy-first chat application built with TypeScript that prioritizes end-to-end encryption, open source transparency, and community ownership. This project serves as an alternative to Discord with a focus on user privacy and data sovereignty.

## Discord server (Ironic, we know)

https://discord.gg/sbCrBdv3py

## Features

### Core Features

- **End-to-end Encryption** - Your conversations stay private
- **Open Source** - Transparent, auditable codebase
- **Community Owned** - Built by and for the community
- **Cross-platform** - Web and desktop applications
- **Self-hostable** - Deploy your own instance

### Technical Stack

- **TypeScript** - For type safety and improved developer experience
- **TanStack Router** - File-based routing with full type safety
- **TailwindCSS** - Utility-first CSS for rapid UI development
- **shadcn/ui** - Beautiful, accessible UI components
- **Hono** - Lightweight, performant server framework
- **tRPC** - End-to-end type-safe APIs
- **Drizzle** - TypeScript-first ORM
- **PostgreSQL** - Reliable database engine
- **Authentication** - Secure email & password authentication
- **Biome** - Linting and formatting
- **Tauri** - Native desktop applications
- **Turborepo** - Optimized monorepo build system

## Getting Started

First, install the dependencies:

```bash
bun install
```

## Database Setup

Sword uses PostgreSQL with Drizzle ORM for data persistence.

1. Make sure you have a PostgreSQL database set up.
2. Update your `apps/server/.env` file with your PostgreSQL connection details.
3. Apply the schema to your database:

```bash
bun db:push
```

## Development

Run the development server:

```bash
bun dev
```

- Web application: [http://localhost:3001](http://localhost:3001)
- API server: [http://localhost:3000](http://localhost:3000)

## Project Structure

```
sword/
├── apps/
│   ├── web/         # Frontend application (React + TanStack Router)
│   └── server/      # Backend API (Hono, TRPC)
└── packages/        # Shared packages and utilities
```

## Available Scripts

- `bun dev`: Start all applications in development mode
- `bun build`: Build all applications for production
- `bun dev:web`: Start only the web application
- `bun dev:server`: Start only the server
- `bun check-types`: Check TypeScript types across all apps
- `bun db:push`: Push schema changes to database
- `bun db:studio`: Open database studio UI
- `bun check`: Run Biome formatting and linting
- `cd apps/web && bun desktop:dev`: Start Tauri desktop app in development
- `cd apps/web && bun desktop:build`: Build Tauri desktop app for production

## Contributing

We welcome contributions from the community! Please read our contributing guidelines and join us in building the future of open-source communication.

## License

This project is open source and available under the [MIT License](LICENSE).

---

Made with ❤️ by the community

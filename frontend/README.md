# P-Verse Frontend

Social media platform frontend built with Next.js, React, and TypeScript.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Package Manager**: pnpm
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Create environment file:
```bash
cp .env.example .env.local
```

3. Configure environment variables in `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Development

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
pnpm build
```

### Production

```bash
pnpm start
```

## Project Structure

```
frontend/
├── app/                      # Next.js App Router pages
│   ├── page.tsx             # Home/Feed page
│   ├── layout.tsx           # Root layout
│   ├── messages/            # Messages page
│   ├── profile/             # Profile page
│   └── settings/            # Settings pages
│       ├── friends/         # Friends list
│       ├── friend-requests/ # Friend requests
│       └── blocked/         # Blocked users
│
├── components/              # React components
│   ├── ui/                 # Shadcn/ui components
│   ├── header.tsx          # App header
│   ├── sidebar.tsx         # Navigation sidebar
│   ├── search-panel.tsx    # Search functionality
│   ├── feed.tsx            # Post feed
│   └── ...
│
├── lib/                    # Utility libraries
│   ├── api.ts             # API client for backend
│   └── utils.ts           # Helper functions
│
├── hooks/                 # Custom React hooks
│   ├── use-toast.ts      # Toast notifications
│   └── use-mobile.ts     # Mobile detection
│
├── public/               # Static assets
└── styles/              # Global styles
```

## Features Implemented

### ✅ Friend System
- Search users by username/name
- Send/cancel friend requests
- Accept/decline friend requests
- View friends list
- Unfriend functionality
- Real-time status updates (FRIEND, PENDING_SENT, PENDING_RECEIVED, STRANGER, BLOCKED)

### 🚧 In Progress
- Post creation and feed
- Messaging system
- Profile management
- Notifications
- Settings pages

## API Integration

The frontend communicates with the backend through the API service located at `lib/api.ts`.

See [API_INTEGRATION.md](./API_INTEGRATION.md) for detailed API documentation.

### Key API Endpoints

- `GET /api/friends/search?keyword={keyword}` - Search users
- `POST /api/friends/request` - Toggle friend request
- `DELETE /api/friends/{userId}` - Unfriend
- `GET /api/friends` - Get friends list
- `GET /api/friends/requests/received` - Get received requests
- `GET /api/friends/requests/sent` - Get sent requests

## Authentication

⚠️ **TODO**: Implement authentication system

The current implementation has a placeholder for authentication in `lib/api.ts`. You need to:

1. Set up authentication (JWT, OAuth, etc.)
2. Store tokens securely (httpOnly cookies recommended)
3. Implement `getAuthToken()` function in `lib/api.ts`
4. Add authentication UI (login/register pages)

## Component Usage

### Search Panel

```tsx
import { SearchPanel } from "@/components/search-panel"

<SearchPanel onClose={() => setShowSearch(false)} />
```

Features:
- Auto-search with 500ms debounce
- Real-time status updates
- Loading states
- Error handling with toast notifications

## Development Guidelines

### Code Style

- Use TypeScript strict mode
- Follow ESLint rules
- Use functional components with hooks
- Prefer named exports for components

### State Management

- Use React hooks for local state
- Consider adding Context API or Zustand for global state

### API Calls

- All API calls should go through `lib/api.ts`
- Use try-catch for error handling
- Show loading states during API calls
- Display user feedback with toast notifications

## Troubleshooting

### Common Issues

**Issue**: API calls fail with CORS errors
- **Solution**: Ensure backend has CORS configured for `http://localhost:3000`

**Issue**: Environment variables not loaded
- **Solution**: Restart dev server after changing `.env.local`

**Issue**: TypeScript errors in components
- **Solution**: Check that all required props are provided and types match

## TODO

- [ ] Implement authentication system
- [ ] Add unit tests (Jest + React Testing Library)
- [ ] Add E2E tests (Playwright or Cypress)
- [ ] Implement WebSocket for real-time updates
- [ ] Add pagination for search results
- [ ] Optimize images with Next.js Image component
- [ ] Add loading skeletons
- [ ] Implement error boundaries
- [ ] Add internationalization (i18n)
- [ ] Set up CI/CD pipeline

## Contributing

1. Create a feature branch from `main`
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

[Add your license here]


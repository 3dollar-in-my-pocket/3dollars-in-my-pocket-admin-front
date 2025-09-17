# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

The project targets both desktop and mobile users. As such, your prompts
should encourage responsive design and component re‑use so that the same
codebase can adapt gracefully across form factors.

## Development Commands

### Package Manager
This project uses **yarn** as the package manager (yarn.lock present).

### Core Commands
- `yarn start` - Start development server
- `yarn build` - Build production bundle
- `yarn test` - Run tests with react-scripts

### CI/CD
The project uses GitHub Actions with Node.js 16.x and runs `yarn install && yarn run build` for CI.

## Project Architecture

### Technology Stack
- **Frontend Framework**: React 18.3.1 with React Router DOM 6.11.0
- **State Management**: Recoil 0.7.7 for global state (see `src/state/LoginStatus.js`)
- **UI Framework**: React Bootstrap 2.10.3 with Bootstrap 5.3.3 and Bootstrap Icons
- **HTTP Client**: Axios 1.7.4 with custom interceptors
- **Notifications**: React Toastify 11.0.5
- **Authentication**: Google OAuth integration

### Project Structure

```
src/
├── api/           # API layer with service modules
├── components/    # Reusable React components
├── constants/     # Application constants (Google auth config)
├── pages/         # Page components organized by feature
├── router/        # React Router configuration and route definitions
├── service/       # Business logic services (LocalStorage)
├── state/         # Recoil state atoms
├── types/         # Type definitions
└── utils/         # Utility functions
```

### Key Architecture Patterns

#### Routing Structure
- Main router in `src/router/Router.js` uses `createBrowserRouter`
- Route groups separated into modules:
  - `manageRoutes.js` - Admin management pages under `/manage/*`
  - `infoRoutes.js` - Information pages
  - `authRoutes.js` - Authentication flows
- All management routes protected by `PrivateRouter` component
- Layout wrapper component provides consistent page structure

#### API Integration
- Centralized API configuration in `src/api/apiBase.js`
- Axios instance with base URL from environment variables
- Request interceptor adds Bearer token from localStorage
- Response interceptor handles common errors with Korean messages
- Feature-specific API modules (adminApi, advertisementApi, etc.)

#### Authentication Flow
- Google OAuth integration with redirect callback at `/auth/google/callback`
- Token storage via `LocalStorageService`
- Login status managed through Recoil atom (`LoginStatus`)
- Environment variables for OAuth configuration (client ID, secret, redirect URI)

#### State Management
- Recoil used for global state management
- Primary state atom: `LoginStatus` in `src/state/LoginStatus.js`
- Local storage service wrapper for persistent data

### Feature Areas
- **Advertisement Management** - Create and edit advertisements with multi-step forms
- **User Management** - User search and detailed user information with medals
- **FAQ Management** - FAQ creation and editing
- **Policy Management** - Policy administration tools
- **Push Notifications** - Push message management
- **Registration Management** - User registration oversight
- **Admin Tools** - Cache management and file upload utilities

### Environment Configuration
- Development API: `http://localhost:5100`
- Production API: `https://dev.threedollars.co.kr` (commented)
- Google OAuth credentials configured via environment variables

### Code Style
- EditorConfig enforces 2-space indentation, LF line endings, UTF-8 encoding
- Max line length: 120 characters
- JSX files use `.jsx` extension, JavaScript files use `.js`
- Korean language used for user-facing messages and error handling

## 💡 REACT BEST PRACTICES
### 📝 Component Design Principles
- Single Responsibility: One component, one purpose
- Composition over Inheritance: Prefer composition patterns
- Props Interface Design: Clear, typed prop interfaces
- Custom Hooks: Extract reusable logic
- Error Boundaries: Graceful error handling
- Accessibility: ARIA labels, semantic HTML

### 🎯 Performance Optimization
- React.memo: Prevent unnecessary re-renders
- useMemo/useCallback: Memoize expensive operations
- Code Splitting: Lazy load components
- Virtual Scrolling: Handle large lists efficiently
- Bundle Analysis: Optimize bundle size
- Image Optimization: Lazy loading, WebP format


### React Security Checklist:

- XSS prevention (DOMPurify)
- CSRF protection
- Secure authentication
- Input validation
- Safe dangerouslySetInnerHTML usage
- Secure API communication
- Environment variable protection
- Content Security Policy

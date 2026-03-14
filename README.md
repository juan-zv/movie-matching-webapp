# Movie Matching Webapp

Movie Matching is a React + TypeScript app for browsing the TMDB 5000 dataset, rating movies, and managing user access with Supabase authentication.

[A React + TypeScript web application that collects user movie ratings to generate personalized, algorithm-driven recommendations for films they haven't seen, while also supporting pair-based matching that computes joint preference profiles to suggest movies optimized for two users watching together.]

## Tech Stack

- React 19
- TypeScript 5.9
- Vite 7
- Tailwind CSS 4
- shadcn/ui + Radix UI primitives
- Supabase (Auth)
- pnpm



### Frontend
- **React 19** - UI library with hooks-based architecture
- **TypeScript 5.9** - Type-safe JavaScript
- **Vite 7** - Fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework

### UI Components
- **shadcn/ui** - Accessible, customizable component library built on:
  - Radix UI primitives
  - Class Variance Authority (CVA) for variant styling
- Components implemented: Alert, Button, Card, Input, Label, Progress

### Backend
- **Supabase** - Backend-as-a-service providing:
  - Authentication (email/password)
  - PostgreSQL database
  - Real-time subscriptions

### Package Management
- **pnpm** - Fast, disk space efficient package manager with workspace support


## Current Implementations

### Authentication and Routing

- Email/password login and sign up flows with Supabase.
- Session-aware route protection for:
  - `/login`
  - `/signup`
  - `/`
  - `/profile`
- Shared auth state and actions through `AuthContext`.
- Initial loading screen with progress indicator while auth state is restored.

### Theme System

- Light, dark, and system theme support.
- Theme selection persisted in localStorage (`movie-matching-theme`).
- Theme toggle available on auth pages and authenticated layout.

### Movie Catalog

- Loads and parses `/tmdb_5000_movies.csv` on page load.
- Custom CSV parser handles quoted fields and embedded JSON-like content.
- Displays key metadata per movie:
  - title
  - release year
  - runtime
  - TMDB average score
  - tagline
  - overview
  - top genres

### Ratings UX

- Interactive 5-star rating widget on each movie card.
- In-memory rating state keyed by movie ID.
- Highlight section for movies rated exactly 4 stars.

### Feed and Performance Behavior

- Responsive movie grid.
- Infinite scroll implemented with Intersection Observer.
- Progressive loading UX for:
  - initial movie fetch/parse
  - loading additional movie cards

### Profile Page

- Dedicated `/profile` route.
- Profile card and liked-movies history UI.
- Currently uses placeholder profile data structure for demo purposes.

## Project Structure

```text
src/
  components/
    mode-toggle.tsx
    MovieCard.tsx
    theme-provider.tsx
    ui/
      alert.tsx
      button.tsx
      card.tsx
      dropdown-menu.tsx
      input.tsx
      label.tsx
      progress.tsx
  contexts/
    AuthContext.tsx
  lib/
    parseCSV.ts
    supabase.ts
    utils.ts
  pages/
    Login.tsx
    MoviesPage.tsx
    ProfilePage.tsx
    SignUp.tsx
  App.tsx
  index.css
  main.tsx
```

## Environment Variables

Create a `.env` file in the project root with:

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=your_supabase_anon_or_publishable_key
```

The app throws an error on startup if these values are missing.

## Getting Started

```bash
pnpm install
pnpm dev
```

## Available Scripts

```bash
pnpm dev      # Run Vite dev server
pnpm build    # Type-check and build for production
pnpm preview  # Preview production build locally
pnpm lint     # Run ESLint
```

## Notes

- Ratings and 4-star tracking are currently client-side only and reset on refresh.
- Recommendation and pair-matching logic are not implemented yet.
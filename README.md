# Movie Matching Webapp

Movie Matching is a React + TypeScript app for browsing the TMDB 5000 dataset, rating movies, and managing user access with Supabase authentication.

[A React + TypeScript web application that collects user movie ratings to generate personalized, algorithm-driven recommendations for films they haven't seen, while also supporting pair-based matching that computes joint preference profiles to suggest movies optimized for two users watching together.]

## Tech Stack

- React 19
- TypeScript 5.9
- Vite 7
- Tailwind CSS 4
- React Router DOM
- React Query (@tanstack/react-query)
- Framer Motion (motion/react)
- shadcn/ui + Radix UI primitives
- Supabase (Auth)
- pnpm

### Frontend
- **React 19** - UI library with hooks-based architecture
- **TypeScript 5.9** - Type-safe JavaScript
- **Vite 7** - Fast build tool and dev server
- **Tailwind CSS 4** - Utility-first CSS framework
- **Framer Motion** - Handling complex swipe and drag animations on cards

### UI Components
- **shadcn/ui** - Accessible, customizable component library built on:
  - Radix UI primitives
  - Class Variance Authority (CVA) for variant styling
- Components implemented: Alert, Button, ButtonGroup, Card, DropdownMenu, Input, Label, Progress, Separator, Skeleton

### Data & State
- **React Query** - Used for infinitely fetching and caching TMDB movie data and searches.
- **Zod & React Hook Form** - Powering validation and complex onboarding steps.

### Backend (Supabase)
- **Supabase Auth** - Handling user registration and session cookies/JWT logic.
- **Supabase Database (PostgreSQL)** - Currently interacting with:
  - `profiles` table: 
    - Holds application-specific user metadata tied to the Auth UID (`user_id`, `username`, `age_range`, `onboarding_completed`, `onboarding_step`, `primary_genres`, `genre_weights`).
  - *Future architecture plans include migrating purely client-side local rating states into standard relational DB `ratings`/`history` tables within Supabase.*

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

### Movie Catalog & Swipe Deck

- Real-time fetching of popular or searched movies via The Movie Database (TMDB) API.
- Implements a Tinder-like `SwipeDeck` leveraging Framer Motion for draggable cards.
- Users can:
  - Swipe Right: Add to Watch Later.
  - Swipe Up: Skip movie.
  - Rate: Use a 5-star widget directly mapped inside the swipe card.
- Displays key metadata per movie natively via TMDB integration:
  - title
  - release year
  - average score
  - overview / synopsis
  - dynamic poster images

### Movie Search & Grids

- Dedicated Search `/search` implementation.
- Infinite scroll grids implemented utilizing React Query and Intersection Observer.
- Search features a debounce architecture to prevent API limits while typing.

### Profile Page

- Dedicated `/profile` route.
- Profile card and liked-movies history UI.
- Currently uses placeholder profile data structure for demo purposes.

## Project Structure

```text
src/
  components/
    layout.tsx
    mode-toggle.tsx
    MovieCard.tsx
    SwipeDeck.tsx
    theme-provider.tsx
    skeletons/
    ui/
      (various shadcn/ui components)
  contexts/
    AuthContext.tsx
  features/
    onboarding/
      components/
        Step1AccountForm.tsx
        Step2ProfileForm.tsx
        Step3RateMovies.tsx
  hooks/
    useDebounce.ts
    useMovieHistory.ts
    useMovies.ts
  lib/
    supabase.ts
    tmdb.ts
    utils.ts
  pages/
    HomePage.tsx
    Login.tsx
    MoviesPage.tsx
    ProfilePage.tsx
    SignUp.tsx
    SyncPage.tsx
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

- Ratings history and Watch Later data are currently tracked client-side (`localStorage`) and through React Query cache.
- True database syncing for movies and recommendation/pair-matching backend logic are ongoing implementations in progress.
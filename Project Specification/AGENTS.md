# AGENTS.md — RecSquad Developer & AI Agent Context

## Project Overview

**RecSquad** is a community-first, mobile-responsive web application designed to connect local recreational athletes in niche and pickup sports (Disc Golf, Ping Pong, Pickleball, Spikeball, Ultimate Frisbee). It enables casual players to discover nearby games, create and join local sports clubs, track sport-specific scores, handle substitute requests, and view aggregate leaderboards.

## Technical Stack & Target Architecture

- **Frontend:** React (SPA or Next.js), Mobile-First UI design, Tailwind CSS / Styled Components.
- **Backend:** Node.js with Express.js (REST API + WebSockets for live scoring).
- **Database:** MongoDB with Mongoose ORM (or PostgreSQL with Prisma using GeoJSON fields).
- **Real-Time & Offline:** Socket.io (real-time scoring), Service Worker + IndexedDB (PWA offline sync support).
- **Maps & Analytics:** Google Maps JavaScript API (geocoding/pins), Chart.js / Recharts (analytics), Twilio API (SMS sub alerts).

## Core Domain Rules & Constraints

1. **API-Contract First:** All API request/response JSON shapes must strictly match Section 7 of the specification. Frontend and backend must use mock endpoints or agreed interfaces before merging code.

2. **Geospatial Queries:** All location data must be stored using valid GeoJSON `Point` structures (`[longitude, latitude]`). Longitude comes **first** in MongoDB GeoJSON arrays (`[lng, lat]`).

3. **Mobile-First Scorekeeping:** The Scorekeeper view (`/matches/:id`) must be optimized for touch screens (min button size 44x44px targets) with minimal typography overhead for outdoor court use.

4. **Role-Based Access Control (RBAC):**
   - `PLAYER`: Default account type upon registration. Can view, search, RSVP, and enter scores.
   - `ORGANIZER`: Assigned automatically when a user creates a group. Allowed to edit group info, schedule events, or archive groups (`PUT/DELETE /api/groups/:id`).
   - `ADMIN`: System-wide access.

5. **Flexible Match Schema:** Match scorecards use a generic JSON payload (`score_data`) to support sport-specific variance (e.g., hole-by-hole for Disc Golf vs. sets/games for Ping Pong/Pickleball).

## Database Schemas & Data Models

### 1. User Model (`Users`)

```typescript
interface User {
  _id: string; // UUID / ObjectID
  name: string;
  email: string; // Unique, indexed
  password_hash: string;
  role: 'ADMIN' | 'ORGANIZER' | 'PLAYER';
  preferred_sports: (
    | 'DISC_GOLF'
    | 'PING_PONG'
    | 'PICKLEBALL'
    | 'SPIKEBALL'
    | 'OTHER'
  )[];
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  createdAt?: Date;
}

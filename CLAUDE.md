# CLAUDE.md - AI Assistant Guide for Hostlopia

## Project Overview

**Hostlopia** is a premium, full-stack hostel and apartment booking platform built with modern web technologies. It provides comprehensive booking management, dynamic pricing, payment processing, and an AI-powered customer support system.

### Project Metadata
- **Name**: Hostlopia
- **Type**: Full-stack web application + React Native mobile admin
- **Primary Language**: TypeScript
- **Framework**: Next.js 15.5.0 (App Router)
- **Database**: PostgreSQL (production) with Prisma ORM
- **Deployment**: Vercel-ready

---

## Tech Stack

### Core Technologies
- **Frontend**: Next.js 15.5.0, React 19.1.0, TypeScript 5.x
- **Backend**: Next.js API Routes (App Router)
- **Database**: PostgreSQL with Prisma ORM 6.14.0
- **Authentication**: NextAuth.js 4.24.11
- **Payments**: Stripe 20.0.0 (Payment Intents + Webhooks)
- **Styling**: TailwindCSS 4.x with custom components
- **AI**: Anthropic Claude SDK 0.60.0
- **Email**: Nodemailer
- **State Management**: React Query (TanStack Query 5.x)

### Mobile Admin
- **Framework**: React Native 0.74.5
- **Navigation**: React Navigation 7.x
- **Push Notifications**: react-native-push-notification
- **Real-time**: Socket.io Client

### Development Tools
- **Package Manager**: npm
- **Type Checking**: TypeScript (strict mode)
- **Linting**: ESLint 9.x (warnings only for builds)
- **Database Management**: Prisma Studio
- **Build Tool**: Turbopack (Next.js)

---

## Project Structure

```
hostel-booking/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (pages)/                  # Public pages
│   │   │   ├── page.tsx             # Homepage
│   │   │   ├── about/               # About page
│   │   │   ├── contact/             # Contact page
│   │   │   ├── apartments/          # Apartment listings
│   │   │   │   ├── [id]/           # Individual apartment pages
│   │   │   │   └── compare/        # Apartment comparison
│   │   │   ├── bookings/           # User bookings
│   │   │   ├── booking-success/    # Post-booking confirmation
│   │   │   └── checkout-test/      # Payment testing
│   │   ├── admin/                   # Admin dashboard (protected)
│   │   │   ├── layout.tsx          # Admin layout with sidebar
│   │   │   ├── page.tsx            # Admin dashboard
│   │   │   ├── apartments/         # Apartment management
│   │   │   ├── bookings/           # Booking management
│   │   │   ├── users/              # User management
│   │   │   ├── reviews/            # Review management
│   │   │   ├── chat/               # Live chat monitoring
│   │   │   ├── learning/           # AI learning dashboard
│   │   │   ├── knowledge-base/     # Knowledge base editor
│   │   │   ├── training/           # AI training interface
│   │   │   ├── chat-settings/      # Chat configuration
│   │   │   ├── import/             # Airbnb import tool
│   │   │   └── settings/           # General settings
│   │   ├── auth/                    # Authentication pages
│   │   │   ├── signin/             # Sign in page
│   │   │   └── signup/             # Sign up page
│   │   └── api/                     # API Routes
│   │       ├── auth/[...nextauth]/ # NextAuth configuration
│   │       ├── apartments/         # Apartment endpoints
│   │       │   ├── route.ts        # List apartments
│   │       │   └── [id]/           # Individual apartment operations
│   │       │       ├── availability/
│   │       │       ├── booked-dates/
│   │       │       ├── calculate-price/
│   │       │       ├── pricing/
│   │       │       └── upload-image/
│   │       ├── bookings/            # Booking endpoints
│   │       │   ├── by-email/       # Fetch bookings by email
│   │       │   ├── create-test/    # Test booking creation
│   │       │   └── [id]/cancel/    # Cancel booking
│   │       ├── payments/            # Stripe integration
│   │       │   ├── create-intent/  # Create payment intent
│   │       │   └── webhook/        # Stripe webhooks
│   │       ├── chat/                # Chat API (AI-powered)
│   │       └── admin/               # Admin-only endpoints
│   │           ├── apartments/     # Admin apartment management
│   │           ├── import-apartments/ # Airbnb import
│   │           ├── learning/       # AI learning endpoints
│   │           └── room-categories/ # Room category management
│   ├── components/                  # React Components
│   │   ├── admin/                  # Admin-specific components
│   │   │   ├── admin-sidebar.tsx
│   │   │   ├── apartment-edit-form.tsx
│   │   │   ├── apartment-edit-form-tabbed.tsx
│   │   │   ├── apartment-new-form-tabbed.tsx
│   │   │   ├── pricing-manager.tsx
│   │   │   └── room-image-manager.tsx
│   │   ├── apartments/             # Apartment display components
│   │   │   ├── apartment-card.tsx
│   │   │   ├── apartment-grid.tsx
│   │   │   ├── apartment-gallery.tsx
│   │   │   ├── apartment-comparison.tsx
│   │   │   ├── amenity-list.tsx
│   │   │   └── room-gallery.tsx (various implementations)
│   │   ├── booking/                # Booking components
│   │   │   ├── booking-calendar.tsx
│   │   │   ├── booking-form.tsx
│   │   │   ├── calendar-modal.tsx
│   │   │   └── pricing-table.tsx
│   │   ├── checkout/               # Payment components
│   │   │   └── checkout-form.tsx
│   │   ├── chat/                   # Chat widget
│   │   │   └── ChatWidget.tsx
│   │   ├── auth/                   # Authentication
│   │   │   └── auth-provider.tsx
│   │   ├── layout/                 # Layout components
│   │   │   ├── navigation.tsx
│   │   │   ├── hero.tsx
│   │   │   └── hero-with-image.tsx
│   │   ├── reviews/                # Review components
│   │   │   └── review-section.tsx
│   │   ├── search/                 # Search and filters
│   │   │   ├── search-filters.tsx
│   │   │   └── search-filters-enhanced.tsx
│   │   └── ui/                     # Reusable UI components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       └── badge.tsx
│   ├── lib/                         # Shared Utilities
│   │   ├── prisma.ts               # Prisma client singleton
│   │   ├── auth.ts                 # Auth helpers (requireAuth, requireAdmin)
│   │   ├── pricing.ts              # Pricing calculation logic
│   │   ├── email.ts                # Email sending utilities
│   │   ├── utils.ts                # General utilities
│   │   ├── knowledge-base.ts       # AI knowledge base
│   │   ├── learning-system.ts      # AI learning system
│   │   └── scrapers/               # Data scrapers
│   │       ├── airbnb-scraper.ts
│   │       └── ical-sync.ts
│   └── types/                       # TypeScript type definitions
├── prisma/
│   ├── schema.prisma               # Database schema
│   ├── migrations/                 # Database migrations
│   └── seed.ts                     # Database seeding script
├── mobile-admin/                    # React Native mobile app
│   ├── src/                        # Mobile app source
│   └── package.json                # Mobile dependencies
├── public/                          # Static assets
│   ├── images/                     # Public images
│   └── uploads/                    # User uploads
├── scripts/                         # Build and utility scripts
├── package.json                     # Dependencies and scripts
├── tsconfig.json                    # TypeScript configuration
├── next.config.ts                   # Next.js configuration
├── postcss.config.mjs              # PostCSS configuration
└── eslint.config.mjs               # ESLint configuration
```

---

## Database Schema

### Core Models

#### User & Authentication
- **User**: Guest and admin accounts with email/password or OAuth
- **Account**: OAuth provider accounts (NextAuth)
- **Session**: User sessions (NextAuth)
- **VerificationToken**: Email verification tokens

#### Apartment Management
- **Apartment**: Property listings with pricing, location, amenities
  - JSON fields: `images`, `amenities` (legacy support)
  - Relational: `apartmentImages[]`, `apartmentAmenities[]`
- **ApartmentImage**: Image gallery with room categorization
- **Amenity**: Reusable amenity catalog
- **ApartmentAmenity**: Many-to-many relation
- **RoomCategory**: Room types for image organization

#### Booking System
- **Booking**: Reservations with payment tracking
  - Status: PENDING, CONFIRMED, CANCELLED, COMPLETED
  - Payment: PENDING, PAID, FAILED, REFUNDED
- **Availability**: Date-specific availability and pricing overrides
  - Status: AVAILABLE, BOOKED, BLOCKED, MAINTENANCE
- **Review**: Guest reviews (1-5 stars) linked to bookings

#### Dynamic Pricing
- **PricingRule**: Date/day-based pricing modifiers
- **SeasonPrice**: Seasonal pricing (HIGH/MID/LOW seasons)
- **EventPrice**: Special event pricing (highest priority)
- **DiscountRule**: Multi-night stay discounts

#### AI Chat System
- **ChatSession**: Customer support chat sessions
- **ChatMessage**: Individual chat messages with confidence scores
- **ChatLearning**: Learning from chat interactions
- **LearnedKnowledge**: AI knowledge base entries
- **KnowledgePattern**: Pattern matching for knowledge retrieval
- **AdminNotification**: Escalation notifications

### Key Relationships
- User → Bookings (1:many)
- User → Reviews (1:many)
- Apartment → Bookings (1:many)
- Apartment → Reviews (1:many)
- Apartment → PricingRules (1:many)
- Booking → Review (1:1)

---

## Development Workflows

### Getting Started

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Set up database
npx prisma generate
npx prisma migrate dev
npm run db:seed

# Start development server
npm run dev
```

### Database Management

```bash
# View database in Prisma Studio
npm run db:studio

# Create new migration
npx prisma migrate dev --name <migration-name>

# Reset database (⚠️ destructive)
npx prisma migrate reset --force

# Seed database
npm run db:seed

# Generate Prisma Client (after schema changes)
npx prisma generate
```

### Code Quality

```bash
# Run linter
npm run lint

# Type checking
npx tsc --noEmit

# Build for production
npm run build

# Start production server
npm start
```

---

## Key Conventions for AI Assistants

### TypeScript Guidelines
1. **Strict Mode**: Always enabled in `tsconfig.json`
2. **Path Aliases**: Use `@/*` for imports from `src/`
   ```typescript
   import { prisma } from '@/lib/prisma'
   import Button from '@/components/ui/button'
   ```
3. **Type Safety**: Leverage Prisma-generated types
   ```typescript
   import { Apartment, Booking } from '@prisma/client'
   ```

### Next.js App Router Patterns

#### Dynamic Rendering
**CRITICAL**: Pages using database queries or `useSearchParams` MUST force dynamic rendering:

```typescript
// Add at top of page.tsx or route.ts
export const dynamic = 'force-dynamic'
```

**Why**: Next.js 15 attempts static generation at build time, which fails for:
- Database queries (Prisma)
- `useSearchParams` hooks
- Real-time data

**Affected pages**: Homepage, apartment listings, search, signin, compare pages

#### Server vs Client Components
- **Server Components** (default): Database access, authentication
- **Client Components** (`'use client'`): Interactivity, hooks, state

```typescript
// Server Component (default)
async function ApartmentPage({ params }: { params: { id: string } }) {
  const apartment = await prisma.apartment.findUnique({ where: { id: params.id } })
  return <div>{apartment.title}</div>
}

// Client Component
'use client'
function BookingCalendar() {
  const [date, setDate] = useState(new Date())
  return <Calendar selected={date} onSelect={setDate} />
}
```

#### Suspense Boundaries
Wrap components using `useSearchParams` in Suspense:

```typescript
<Suspense fallback={<div>Loading...</div>}>
  <ComponentWithSearchParams />
</Suspense>
```

### Authentication Patterns

#### Protecting Pages
```typescript
import { requireAuth, requireAdmin } from '@/lib/auth'

// User authentication required
export default async function BookingsPage() {
  await requireAuth() // Redirects to /auth/signin if not authenticated
  // ... rest of page
}

// Admin authentication required
export default async function AdminDashboard() {
  await requireAdmin() // Redirects if not admin
  // ... rest of page
}
```

#### Getting Current User
```typescript
import { getCurrentUser } from '@/lib/auth'

const user = await getCurrentUser()
if (user) {
  console.log(user.email, user.role)
}
```

### API Route Patterns

#### Standard API Route Structure
```typescript
// src/app/api/resource/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAuth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const data = await prisma.resource.findMany()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  await requireAuth() // Protect with auth

  try {
    const body = await request.json()
    const data = await prisma.resource.create({ data: body })
    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create' }, { status: 400 })
  }
}
```

#### Dynamic Routes
```typescript
// src/app/api/apartments/[id]/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const apartment = await prisma.apartment.findUnique({
    where: { id: params.id }
  })
  return NextResponse.json(apartment)
}
```

### Pricing System

#### Price Calculation Priority
1. **Event Prices** (highest priority) - Special events like holidays
2. **Season Prices** - High/Mid/Low seasons
3. **Base Price** (fallback)

#### Using Pricing Functions
```typescript
import { getPriceForDate, calculateTotalPrice } from '@/lib/pricing'

// Get price for specific date
const price = await getPriceForDate(apartmentId, new Date('2025-12-25'), basePrice)

// Calculate total with discounts
const breakdown = await calculateTotalPrice(
  apartmentId,
  checkInDate,
  checkOutDate,
  guests
)
```

#### Date Handling in Pricing
- **Format**: YYYY-MM-DD strings for database storage
- **End Dates**: Always exclusive (like checkout dates)
- **Timezone**: Use local dates to avoid timezone issues

```typescript
// Correct date formatting
const year = date.getFullYear()
const month = String(date.getMonth() + 1).padStart(2, '0')
const day = String(date.getDate()).padStart(2, '0')
const dateStr = `${year}-${month}-${day}`
```

### Database Patterns

#### Prisma Client Usage
```typescript
import { prisma } from '@/lib/prisma'

// Always use the singleton instance
const apartments = await prisma.apartment.findMany({
  where: { isActive: true },
  include: {
    apartmentImages: true,
    apartmentAmenities: { include: { amenity: true } }
  },
  orderBy: { createdAt: 'desc' }
})
```

#### JSON Fields (Legacy)
Some models have JSON string fields (`images`, `amenities`) for backwards compatibility:

```typescript
// Parsing JSON fields
const images = JSON.parse(apartment.images || '[]')
const amenities = JSON.parse(apartment.amenities || '[]')

// Prefer relational data for new code
const images = apartment.apartmentImages
const amenities = apartment.apartmentAmenities.map(aa => aa.amenity)
```

### Stripe Integration

#### Payment Flow
1. Frontend creates payment intent: `POST /api/payments/create-intent`
2. Stripe Elements collects payment
3. Webhook confirms payment: `POST /api/payments/webhook`
4. Booking status updated to CONFIRMED

#### Webhook Handling
```typescript
// Webhook must verify signature
const sig = request.headers.get('stripe-signature')
const event = stripe.webhooks.constructEvent(body, sig, webhookSecret)

// Handle events
switch (event.type) {
  case 'payment_intent.succeeded':
    // Update booking to CONFIRMED
    break
  case 'payment_intent.payment_failed':
    // Mark payment as FAILED
    break
}
```

### AI Chat System

#### Knowledge Base Structure
- **LearnedKnowledge**: Stores facts, Q&A pairs, policies
- **ChatLearning**: Learns from admin interventions
- **Categories**: checkin, policies, amenities, pricing, etc.

#### Chat Flow
1. Guest sends message
2. Claude searches knowledge base
3. If confident (>0.7), responds directly
4. If uncertain, escalates to admin
5. Admin response is learned for future

### Image Handling

#### Remote Image Domains
Configured in `next.config.ts`:
- images.unsplash.com (placeholders)
- *.muscache.com (Airbnb images)
- *.airbnb.com (Airbnb images)

#### Room-Based Image Organization
Images can be categorized by `RoomCategory` for better gallery organization:
```typescript
const bedroomImages = apartmentImages.filter(img => img.room?.name === 'Bedroom')
```

### Environment Variables

Required variables (create `.env.local`):

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Anthropic (for AI chat)
ANTHROPIC_API_KEY="sk-ant-..."

# Email (optional)
EMAIL_SERVER_USER="smtp-user"
EMAIL_SERVER_PASSWORD="smtp-password"
EMAIL_SERVER_HOST="smtp.example.com"
EMAIL_SERVER_PORT="587"
EMAIL_FROM="noreply@hostlopia.com"
```

---

## Common Tasks for AI Assistants

### Adding a New API Endpoint

1. Create route file: `src/app/api/resource/route.ts`
2. Export HTTP method handlers (GET, POST, etc.)
3. Add authentication if needed
4. Return `NextResponse.json()`

### Creating a New Page

1. Create file in `src/app/[route]/page.tsx`
2. Add `export const dynamic = 'force-dynamic'` if using DB/searchParams
3. Use Server Components for data fetching
4. Extract interactive UI to Client Components

### Adding a Database Field

1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name add_field_name`
3. Update TypeScript types (auto-generated)
4. Update API routes and components

### Creating a New Component

1. Choose location based on purpose:
   - `components/ui/` - Reusable UI elements
   - `components/apartments/` - Apartment-specific
   - `components/admin/` - Admin-only
2. Use TypeScript for props
3. Add `'use client'` only if needed

### Debugging Build Errors

Common issues:
1. **DB queries at build time**: Add `export const dynamic = 'force-dynamic'`
2. **useSearchParams errors**: Wrap in Suspense boundary
3. **Type errors**: Check Prisma schema matches queries
4. **Import errors**: Verify path aliases use `@/`

---

## Testing Patterns

### Stripe Testing

Use test cards:
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Auth required: `4000 0025 0000 3155`

Use `/checkout-test` page for testing payment flow.

### Authentication Testing

Test accounts from seed data:
```
Admin: admin@hostlopia.com / admin123
Guest: test@example.com / password123
```

### Database Testing

```bash
# Create test booking
npm run db:seed

# Test Airbnb import
# Visit /admin/import
```

---

## Deployment

### Vercel Deployment (Recommended)

1. Connect GitHub repository
2. Set environment variables in Vercel dashboard
3. Deployment triggers automatically on push

**Build Configuration**:
- Build Command: `npm run build` (includes `prisma generate`)
- Output Directory: `.next`
- Install Command: `npm install`

**Important**:
- TypeScript/ESLint errors are set to warnings for deployment
- Database migrations run automatically via `postinstall` hook

### Database Migration on Deploy

```bash
# Production migration (manual)
npx prisma migrate deploy
```

### Environment Variables

Ensure all required env vars are set in Vercel:
- DATABASE_URL (PostgreSQL connection string)
- NEXTAUTH_URL (production URL)
- NEXTAUTH_SECRET (generate new for production)
- STRIPE keys (use live keys for production)
- ANTHROPIC_API_KEY

---

## Mobile Admin App

Located in `mobile-admin/` directory:
- **Platform**: React Native 0.74.5
- **Purpose**: Admin notifications and booking management on mobile
- **Features**: Push notifications, real-time chat monitoring, booking updates

```bash
# Run iOS
cd mobile-admin
npm run ios

# Run Android
npm run android
```

---

## Airbnb Integration

### iCal Sync
Import Airbnb bookings via iCal URL:
1. Get iCal URL from Airbnb calendar
2. Add to apartment via admin dashboard
3. System syncs bookings automatically

### Scraping
Apartment data can be imported from Airbnb:
- Uses Cheerio for HTML parsing
- Extracts images, amenities, pricing
- See `src/lib/scrapers/airbnb-scraper.ts`

---

## Code Style Guidelines

### File Naming
- **Components**: PascalCase (`ApartmentCard.tsx`)
- **Utilities**: kebab-case (`pricing-calculator.ts`)
- **Pages**: kebab-case (`booking-success/page.tsx`)
- **API Routes**: kebab-case (`route.ts`)

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react'
import { Button } from '@/components/ui/button'

// 2. Type definitions
interface Props {
  title: string
  onSubmit: () => void
}

// 3. Component
export default function MyComponent({ title, onSubmit }: Props) {
  // 4. Hooks
  const [isLoading, setIsLoading] = useState(false)

  // 5. Handlers
  const handleClick = async () => {
    setIsLoading(true)
    await onSubmit()
    setIsLoading(false)
  }

  // 6. Render
  return (
    <div>
      <h1>{title}</h1>
      <Button onClick={handleClick} disabled={isLoading}>
        Submit
      </Button>
    </div>
  )
}
```

### Database Queries
- Use `include` for relations
- Use `select` to limit fields
- Add indexes for frequently queried fields
- Use transactions for multi-step operations

```typescript
// Good: Efficient query with relations
const apartment = await prisma.apartment.findUnique({
  where: { id },
  include: {
    apartmentImages: { orderBy: { order: 'asc' } },
    reviews: { take: 5, orderBy: { createdAt: 'desc' } }
  }
})

// Better: Select only needed fields
const apartment = await prisma.apartment.findUnique({
  where: { id },
  select: {
    id: true,
    title: true,
    price: true,
    apartmentImages: {
      select: { url: true, alt: true },
      orderBy: { order: 'asc' }
    }
  }
})
```

---

## Security Considerations

### Authentication
- **All admin routes**: Protected with `requireAdmin()`
- **User-specific data**: Protected with `requireAuth()`
- **API routes**: Validate user permissions

### Data Validation
- **Input**: Validate all user inputs
- **SQL Injection**: Prevented by Prisma (parameterized queries)
- **XSS**: React escapes by default
- **CSRF**: NextAuth handles CSRF tokens

### Stripe
- **Webhook signatures**: Always verify
- **Client-side**: Never expose secret key
- **Payment intents**: Verify amounts server-side

### Environment Variables
- **Never commit**: `.env*` files in `.gitignore`
- **Production secrets**: Different from development
- **API keys**: Rotate regularly

---

## Known Issues & Workarounds

### Build-Time Database Access
**Issue**: Next.js 15 tries to render pages at build time, causing DB connection errors.

**Solution**: Add `export const dynamic = 'force-dynamic'` to pages using:
- Database queries
- `useSearchParams`
- Real-time data

### ESLint/TypeScript in Production
**Issue**: Strict type checking can block deployments during rapid development.

**Current State**:
```typescript
// next.config.ts
eslint: { ignoreDuringBuilds: true }
typescript: { ignoreBuildErrors: true }
```

**Recommendation**: Fix type errors before major releases.

### Stripe Webhook Local Testing
**Issue**: Webhooks need public URL.

**Solution**: Use Stripe CLI for local testing:
```bash
stripe listen --forward-to localhost:3000/api/payments/webhook
```

### Date Timezone Issues
**Issue**: Dates stored as strings can have timezone problems.

**Solution**: Always format dates in local timezone before string conversion:
```typescript
const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
```

---

## Recent Changes (Git History)

Last 5 significant commits:
1. **PostgreSQL Migration**: Switched from SQLite to PostgreSQL for production
2. **Dynamic Rendering**: Added `force-dynamic` to pages with DB/searchParams
3. **Suspense Boundaries**: Wrapped `useSearchParams` components
4. **Stripe Fixes**: Improved webhook handling and runtime initialization
5. **Admin Features**: Added tabbed forms and room image management

---

## Resources & Documentation

### Official Docs
- [Next.js 15 Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [NextAuth.js](https://next-auth.js.org/)
- [Stripe API](https://stripe.com/docs/api)
- [TailwindCSS](https://tailwindcss.com/docs)
- [Anthropic Claude](https://docs.anthropic.com/)

### Project-Specific
- README.md - General setup instructions
- prisma/schema.prisma - Complete database schema
- src/lib/pricing.ts - Pricing calculation logic
- src/lib/auth.ts - Authentication helpers

---

## AI Assistant Best Practices

### When Making Changes

1. **Read Before Modifying**: Always read existing code before suggesting changes
2. **Understand Context**: Check related files, imports, and dependencies
3. **Preserve Patterns**: Follow existing code patterns and conventions
4. **Test Thoroughly**: Consider edge cases and test changes
5. **Update Types**: Ensure TypeScript types are updated with schema changes

### Code Generation

1. **Use Path Aliases**: Always use `@/` imports
2. **Force Dynamic**: Add when using DB/searchParams
3. **Type Everything**: Provide proper TypeScript types
4. **Error Handling**: Include try-catch and proper error responses
5. **Authentication**: Add auth checks to protected routes

### Database Changes

1. **Migration First**: Update schema.prisma, then migrate
2. **Cascade Deletes**: Consider onDelete behavior
3. **Indexes**: Add for foreign keys and frequently queried fields
4. **Seed Data**: Update seed script if needed
5. **Backwards Compat**: Consider existing data when adding required fields

### Communication

1. **Explain Changes**: Describe what and why
2. **Highlight Risks**: Note potential breaking changes
3. **Provide Examples**: Show usage of new features
4. **Reference Files**: Use `file:line` format (e.g., `src/app/page.tsx:42`)

---

## Troubleshooting Guide

### "Cannot access DB during build"
→ Add `export const dynamic = 'force-dynamic'` to page

### "useSearchParams should be wrapped with Suspense"
→ Wrap component in `<Suspense fallback={...}>`

### "Prisma Client not found"
→ Run `npx prisma generate`

### "Type errors in build"
→ Check schema matches queries, run `npx tsc --noEmit`

### "Stripe webhook signature verification failed"
→ Check `STRIPE_WEBHOOK_SECRET` matches Stripe CLI/dashboard

### "Image failed to load"
→ Add domain to `next.config.ts` → `images.remotePatterns`

### "Authentication not working"
→ Check `NEXTAUTH_URL` matches current URL, verify `NEXTAUTH_SECRET` is set

---

## Summary

Hostlopia is a production-ready, feature-rich booking platform with:
- ✅ Modern Next.js 15 architecture
- ✅ Type-safe database with Prisma
- ✅ Secure authentication with NextAuth
- ✅ Stripe payment processing
- ✅ AI-powered customer support
- ✅ Dynamic pricing engine
- ✅ Admin dashboard
- ✅ Mobile admin app
- ✅ Airbnb integration

**Key Takeaway**: This is a sophisticated, multi-tenant booking system. Always prioritize data integrity, security, and user experience when making changes.

---

**Last Updated**: 2025-12-09
**Branch**: `claude/claude-md-miy6f0yp6wxk3xuf-015N8BKmRBr5fN3o2JaEZSDV`
**PostgreSQL**: Production database
**Deployment**: Vercel-ready

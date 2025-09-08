# 🏨 HOSTLOPIA - Premium Hostel Booking Platform

A modern, full-stack accommodation booking platform built with Next.js, TypeScript, and Stripe payments. HOSTLOPIA is the ultimate solution for hostels, short-term rentals, and apartment management worldwide.

## ✨ Features

### 🎯 **Core Functionality**
- **Apartment Management** - Comprehensive listing with images, amenities, and pricing
- **Interactive Booking Calendar** - Real-time availability with date range selection
- **Secure Payment Processing** - Stripe integration with webhook handling
- **Review System** - Guest reviews and ratings
- **Responsive Design** - Optimized for mobile and desktop

### 🚀 **Advanced Features**
- **Dynamic Pricing** - Weekend premiums and seasonal adjustments
- **Availability Management** - Real-time availability checking and booking conflicts
- **Multi-language Ready** - Infrastructure for internationalization
- **SEO Optimized** - Server-side rendering and meta tags
- **Type Safety** - Full TypeScript implementation

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: Tailwind CSS with custom components
- **Database**: PostgreSQL/SQLite with Prisma ORM
- **Payments**: Stripe Payment Intents
- **Calendar**: React Day Picker
- **Development**: Turbopack for fast development

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Stripe account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hostlopia
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the following variables in `.env.local`:
   ```env
   # Database
   DATABASE_URL="file:./dev.db"
   
   # Stripe (Get from https://dashboard.stripe.com/test/apikeys)
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
   STRIPE_SECRET_KEY="sk_test_..."
   STRIPE_WEBHOOK_SECRET="whsec_..."
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev --name init
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 💳 Stripe Setup

### Test Mode Setup
1. Create a [Stripe account](https://stripe.com)
2. Get your test API keys from the [dashboard](https://dashboard.stripe.com/test/apikeys)
3. Add keys to your `.env.local` file
4. Set up webhook endpoint: `http://localhost:3000/api/payments/webhook`

### Webhook Events
Configure your Stripe webhook to listen for:
- `payment_intent.succeeded`
- `payment_intent.payment_failed`
- `payment_intent.canceled`

## 📁 Project Structure

```
hostlopia/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── apartments/    # Apartment endpoints
│   │   │   └── payments/      # Stripe integration
│   │   ├── apartments/[id]/   # Dynamic apartment pages
│   │   ├── checkout/          # Payment flow
│   │   └── booking/           # Booking management
│   ├── components/            # React components
│   │   ├── apartments/       # Apartment-related UI
│   │   ├── booking/          # Calendar & booking forms
│   │   ├── checkout/         # Payment components
│   │   └── layout/           # Navigation & layout
│   └── lib/                  # Utilities & database
├── prisma/                   # Database schema & migrations
└── public/                   # Static assets
```

## 🔧 Development

### Database Management
```bash
# View database in Prisma Studio
npm run db:studio

# Reset database and reseed
npx prisma migrate reset --force

# Add sample reviews and bookings
npx tsx prisma/seed-reviews.ts
```

### Code Quality
```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

## 🏗️ Architecture

### Database Schema
- **Users** - Guest and admin accounts
- **Apartments** - Property listings with amenities
- **Bookings** - Reservation management
- **Availability** - Calendar and pricing rules
- **Reviews** - Guest feedback system

### API Design
- **RESTful endpoints** for apartment management
- **Stripe webhooks** for payment processing  
- **Real-time availability** checking
- **Type-safe** request/response handling

### Security Features
- **Payment security** via Stripe
- **Input validation** on all forms
- **SQL injection protection** via Prisma
- **Environment variable** protection

## 🌐 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on git push

### Environment Variables for Production
```env
DATABASE_URL="postgresql://..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

## 🚧 Future Enhancements

### Phase 2 Features
- [ ] **User Authentication** - NextAuth.js integration
- [ ] **Admin Dashboard** - Property and booking management
- [ ] **Email Notifications** - Booking confirmations
- [ ] **Airbnb Sync** - Calendar synchronization
- [ ] **Multi-language** - i18n implementation
- [ ] **Advanced Search** - Filters and sorting
- [ ] **Mobile App** - React Native version

### Phase 3 Features  
- [ ] **Analytics Dashboard** - Revenue and occupancy tracking
- [ ] **Dynamic Pricing** - AI-powered pricing optimization
- [ ] **Chat System** - Guest-host communication
- [ ] **Loyalty Program** - Repeat guest rewards
- [ ] **Integration APIs** - Third-party booking platforms

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Open an issue on GitHub
- **Discord**: Join our development community

## 🙏 Acknowledgments

- **Stripe** for secure payment processing
- **Prisma** for database management
- **Next.js** team for the amazing framework
- **Tailwind CSS** for rapid UI development
- **Unsplash** for beautiful apartment images

---

**HOSTLOPIA - Revolutionizing the hospitality industry with technology ❤️**
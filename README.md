# BookingHub - Multi-Vendor Booking & Scheduling System

A production-grade, full-stack booking and scheduling platform built with Next.js 14, TypeScript, Prisma, PostgreSQL, and Redis.

## 🚀 Features

### For Customers
- Browse and search vendors by category
- View real-time availability with slot locking
- Book appointments with secure Stripe payments
- Receive email notifications for bookings
- Manage booking history (view, reschedule, cancel)
- Leave reviews and ratings

### For Vendors
- Complete vendor registration and approval workflow
- Create and manage services with pricing
- Set weekly availability schedules
- Configure special hours and days off
- Real-time booking management
- Google Calendar & Outlook sync
- View analytics and revenue reports
- Accept/reject booking requests

### For Admins
- Vendor approval/rejection system
- User management
- Category management
- Analytics dashboard with:
  - Total bookings and revenue
  - Activity graphs
  - Top vendors and services
  - Platform metrics

### Technical Features
- **Real-time slot locking** with Redis
- **Conflict detection** for double-booking prevention
- **Automatic lock expiration** for abandoned bookings
- **Stripe integration** for payments and refunds
- **Email notifications** with beautiful templates
- **Calendar synchronization** (Google & Outlook)
- **Role-based authentication** (Customer, Vendor, Admin)
- **Responsive design** with Tailwind CSS
- **Type-safe** with TypeScript and Prisma

## 🛠️ Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Cache/Locks:** Redis (Upstash)
- **Authentication:** NextAuth.js
- **Payments:** Stripe
- **Email:** Resend
- **Styling:** Tailwind CSS
- **UI Components:** Custom components with Radix UI primitives
- **State Management:** Zustand + React Query
- **Calendar APIs:** Google Calendar API, Microsoft Graph API

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Redis instance
- Stripe account
- Resend account (for emails)
- Google Cloud Console project (for Google Calendar)
- Microsoft Azure app (for Outlook Calendar)

## 🔧 Installation

### 1. Clone the repository

```bash
git clone <repository-url>
cd multi-vendor-booking
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required environment variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/booking_system"

# Redis
REDIS_URL="redis://localhost:6379"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# Stripe
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PUBLISHABLE_KEY="pk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email (Resend)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"

# Google Calendar
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Microsoft Graph (Outlook)
MICROSOFT_CLIENT_ID="your-microsoft-client-id"
MICROSOFT_CLIENT_SECRET="your-microsoft-client-secret"
MICROSOFT_TENANT_ID="your-tenant-id"

# App Settings
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_APP_NAME="BookingHub"
SLOT_LOCK_DURATION_MINUTES=10
```

### 4. Set up the database

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed the database
npx prisma db seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🗄️ Database Setup

### Local PostgreSQL

```bash
# Install PostgreSQL (if not already installed)
# On macOS:
brew install postgresql@14
brew services start postgresql@14

# Create database
createdb booking_system

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://localhost:5432/booking_system"
```

### Using Supabase (Recommended for production)

1. Create a project at [supabase.com](https://supabase.com)
2. Get your connection string from Project Settings > Database
3. Update `DATABASE_URL` in `.env`

### Using Railway

1. Create a project at [railway.app](https://railway.app)
2. Add PostgreSQL service
3. Copy the connection string
4. Update `DATABASE_URL` in `.env`

## 🔴 Redis Setup

### Local Redis

```bash
# Install Redis
# On macOS:
brew install redis
brew services start redis

# Update REDIS_URL in .env
REDIS_URL="redis://localhost:6379"
```

### Using Upstash (Recommended for production)

1. Create a database at [upstash.com](https://upstash.com)
2. Copy the Redis URL
3. Update `REDIS_URL` in `.env`

## 💳 Stripe Setup

1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from Dashboard > Developers > API keys
3. Set up webhook endpoint:
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
4. Copy webhook signing secret
5. Update Stripe variables in `.env`

## 📧 Email Setup (Resend)

1. Create account at [resend.com](https://resend.com)
2. Verify your domain or use test mode
3. Get API key from Dashboard
4. Update `RESEND_API_KEY` and `EMAIL_FROM` in `.env`

## 📅 Calendar Integration Setup

### Google Calendar

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/calendar/google/callback`
6. Update `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`

### Outlook Calendar

1. Go to [Azure Portal](https://portal.azure.com)
2. Register a new application
3. Add Microsoft Graph API permissions: `Calendars.ReadWrite`, `offline_access`
4. Add redirect URI: `http://localhost:3000/api/calendar/outlook/callback`
5. Create client secret
6. Update Microsoft variables in `.env`

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in [Vercel](https://vercel.com)
3. Add environment variables
4. Deploy

```bash
# Or use Vercel CLI
npm i -g vercel
vercel
```

### Deploy Database

- **Supabase:** Already hosted
- **Railway:** Add PostgreSQL service
- **Neon:** Create database at [neon.tech](https://neon.tech)

### Deploy Redis

- **Upstash:** Already hosted
- **Railway:** Add Redis service

### Post-Deployment Steps

1. Update `NEXTAUTH_URL` and `NEXT_PUBLIC_APP_URL` with your domain
2. Update Stripe webhook URL
3. Update OAuth redirect URIs for Google and Microsoft
4. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```

## 📁 Project Structure

```
multi-vendor-booking/
├── app/                      # Next.js app directory
│   ├── api/                  # API routes
│   │   ├── auth/            # NextAuth endpoints
│   │   ├── bookings/        # Booking management
│   │   ├── vendors/         # Vendor operations
│   │   ├── payments/        # Stripe integration
│   │   └── webhooks/        # Webhook handlers
│   ├── (auth)/              # Auth pages (signin, signup)
│   ├── (customer)/          # Customer dashboard
│   ├── (vendor)/            # Vendor dashboard
│   ├── (admin)/             # Admin dashboard
│   ├── vendors/             # Public vendor browsing
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ui/                  # Reusable UI components
│   ├── forms/               # Form components
│   ├── calendar/            # Calendar components
│   └── dashboard/           # Dashboard components
├── lib/                     # Utility libraries
│   ├── prisma.ts           # Prisma client
│   ├── redis.ts            # Redis client & slot locking
│   ├── auth.ts             # NextAuth configuration
│   ├── stripe.ts           # Stripe integration
│   ├── email.ts            # Email service
│   ├── scheduling.ts       # Scheduling engine
│   ├── calendar-google.ts  # Google Calendar sync
│   └── calendar-outlook.ts # Outlook Calendar sync
├── prisma/
│   └── schema.prisma       # Database schema
├── types/                   # TypeScript types
└── public/                  # Static assets
```

## 🔐 Default Admin Account

After seeding the database, use these credentials:

- **Email:** admin@bookinghub.com
- **Password:** admin123

**⚠️ Change these credentials immediately in production!**

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Generate coverage report
npm test:coverage
```

## 📊 Key Workflows

### Booking Flow
1. Customer browses vendors and services
2. Selects date and views available slots
3. Clicks on slot → Redis locks it for 10 minutes
4. Completes payment via Stripe
5. Booking confirmed → Email sent to both parties
6. Event synced to vendor's calendar

### Vendor Approval Flow
1. User signs up as vendor
2. Admin reviews application
3. Admin approves/rejects
4. Vendor receives email notification
5. Approved vendors can create services

### Slot Locking Mechanism
- When customer clicks a slot, it's locked in Redis
- Lock expires after 10 minutes (configurable)
- Other customers see slot as unavailable
- On booking completion, lock is released
- On abandonment, lock auto-expires

## 🐛 Troubleshooting

### Database Connection Issues
```bash
# Check PostgreSQL is running
pg_isready

# Test connection
npx prisma db push
```

### Redis Connection Issues
```bash
# Check Redis is running
redis-cli ping

# Should return: PONG
```

### Prisma Issues
```bash
# Reset database (⚠️ deletes all data)
npx prisma migrate reset

# Regenerate client
npx prisma generate
```

## 📝 API Documentation

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/signin` - Sign in
- `POST /api/auth/signout` - Sign out

### Bookings
- `GET /api/bookings` - Get user bookings
- `POST /api/bookings` - Create booking
- `PATCH /api/bookings/[id]` - Update booking
- `DELETE /api/bookings/[id]` - Cancel booking

### Vendors
- `GET /api/vendors` - List vendors
- `GET /api/vendors/[id]` - Get vendor details
- `POST /api/vendors` - Create vendor profile
- `PATCH /api/vendors/[id]` - Update vendor

### Availability
- `GET /api/availability/[vendorId]` - Get available slots
- `POST /api/availability/lock` - Lock time slot
- `POST /api/availability/unlock` - Release time slot

### Payments
- `POST /api/payments/create-intent` - Create payment intent
- `POST /api/payments/refund` - Process refund
- `POST /api/webhooks/stripe` - Stripe webhook handler

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For issues and questions:
- Open an issue on GitHub
- Email: support@bookinghub.com

## 🎯 Roadmap

- [ ] SMS notifications via Twilio
- [ ] Push notifications
- [ ] Mobile app (React Native)
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] Recurring bookings
- [ ] Group bookings
- [ ] Waitlist functionality
- [ ] Video consultation integration

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.

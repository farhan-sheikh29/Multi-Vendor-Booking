# Deployment Guide

## Prerequisites Checklist

Before deploying, ensure you have:

- [ ] GitHub repository created
- [ ] Vercel account
- [ ] PostgreSQL database (Supabase/Railway/Neon)
- [ ] Redis instance (Upstash)
- [ ] Stripe account with API keys
- [ ] Resend account with API key
- [ ] Google Cloud Console project (for Calendar)
- [ ] Microsoft Azure app (for Outlook)

## Step-by-Step Deployment

### 1. Database Setup

#### Option A: Supabase (Recommended)

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for database provisioning
4. Go to Project Settings > Database
5. Copy the connection string (URI format)
6. Replace `[YOUR-PASSWORD]` with your database password

```
postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
```

#### Option B: Railway

1. Go to [railway.app](https://railway.app)
2. Create new project
3. Add PostgreSQL service
4. Copy the connection string from Variables tab

#### Option C: Neon

1. Go to [neon.tech](https://neon.tech)
2. Create new project
3. Copy the connection string

### 2. Redis Setup (Upstash)

1. Go to [upstash.com](https://upstash.com)
2. Create new Redis database
3. Choose region closest to your app
4. Copy the Redis URL

### 3. Stripe Setup

1. Go to [stripe.com](https://stripe.com/dashboard)
2. Get API keys from Developers > API keys
3. Copy both Publishable and Secret keys
4. Set up webhook:
   - Go to Developers > Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
   - Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
   - Copy webhook signing secret

### 4. Email Setup (Resend)

1. Go to [resend.com](https://resend.com)
2. Add and verify your domain (or use test mode)
3. Create API key
4. Copy the API key

### 5. Google Calendar Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable Google Calendar API
4. Go to Credentials
5. Create OAuth 2.0 Client ID
6. Application type: Web application
7. Add authorized redirect URI: `https://yourdomain.com/api/calendar/google/callback`
8. Copy Client ID and Client Secret

### 6. Outlook Calendar Setup

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to Azure Active Directory > App registrations
3. New registration
4. Add redirect URI: `https://yourdomain.com/api/calendar/outlook/callback`
5. Go to Certificates & secrets
6. Create new client secret
7. Go to API permissions
8. Add Microsoft Graph permissions: `Calendars.ReadWrite`, `offline_access`
9. Copy Application (client) ID, Directory (tenant) ID, and Client secret

### 7. Deploy to Vercel

#### Via GitHub (Recommended)

1. Push code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/booking-hub.git
git push -u origin main
```

2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure project:
   - Framework Preset: Next.js
   - Root Directory: ./
   - Build Command: `npm run build`
   - Output Directory: .next

6. Add environment variables (all from .env):
   - DATABASE_URL
   - REDIS_URL
   - NEXTAUTH_URL (your Vercel domain)
   - NEXTAUTH_SECRET
   - STRIPE_SECRET_KEY
   - STRIPE_PUBLISHABLE_KEY
   - STRIPE_WEBHOOK_SECRET
   - RESEND_API_KEY
   - EMAIL_FROM
   - GOOGLE_CLIENT_ID
   - GOOGLE_CLIENT_SECRET
   - MICROSOFT_CLIENT_ID
   - MICROSOFT_CLIENT_SECRET
   - MICROSOFT_TENANT_ID
   - NEXT_PUBLIC_APP_URL (your Vercel domain)
   - NEXT_PUBLIC_APP_NAME
   - SLOT_LOCK_DURATION_MINUTES

7. Click "Deploy"

#### Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Follow prompts and add environment variables
```

### 8. Post-Deployment Setup

#### Run Database Migrations

```bash
# Set DATABASE_URL environment variable locally
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

Or use Vercel CLI:

```bash
vercel env pull .env.production
npx prisma migrate deploy
```

#### Seed Initial Data (Optional)

Create admin user and categories:

```bash
npx prisma db seed
```

#### Update External Services

1. **Stripe Webhook URL**: Update to `https://yourdomain.vercel.app/api/webhooks/stripe`
2. **Google OAuth**: Add `https://yourdomain.vercel.app/api/calendar/google/callback`
3. **Microsoft OAuth**: Add `https://yourdomain.vercel.app/api/calendar/outlook/callback`

### 9. Verify Deployment

1. Visit your Vercel URL
2. Test user registration
3. Test vendor registration
4. Create a test booking
5. Verify email notifications
6. Test payment flow (use Stripe test cards)

### 10. Custom Domain (Optional)

1. Go to Vercel project settings
2. Navigate to Domains
3. Add your custom domain
4. Update DNS records as instructed
5. Update environment variables:
   - NEXTAUTH_URL
   - NEXT_PUBLIC_APP_URL

## Environment Variables Reference

```env
# Database
DATABASE_URL="postgresql://..."

# Redis
REDIS_URL="redis://..."

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Email
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"

# Google Calendar
GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

# Microsoft Graph
MICROSOFT_CLIENT_ID="..."
MICROSOFT_CLIENT_SECRET="..."
MICROSOFT_TENANT_ID="..."

# App Settings
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
NEXT_PUBLIC_APP_NAME="BookingHub"
SLOT_LOCK_DURATION_MINUTES=10
```

## Monitoring & Maintenance

### Vercel Dashboard

- Monitor deployment status
- View function logs
- Check analytics
- Review error reports

### Database Monitoring

- **Supabase**: Use built-in dashboard
- **Railway**: Monitor usage and performance
- **Neon**: Check connection pooling

### Redis Monitoring

- **Upstash**: Monitor commands and memory usage

### Stripe Dashboard

- Monitor payments
- Handle disputes
- View analytics

## Troubleshooting

### Build Failures

```bash
# Check build logs in Vercel
# Common issues:
# 1. Missing environment variables
# 2. TypeScript errors
# 3. Prisma client not generated

# Fix: Ensure all env vars are set
# Fix: Run `npm run build` locally first
```

### Database Connection Issues

```bash
# Verify connection string
# Check IP whitelist (if applicable)
# Ensure database is running
```

### Webhook Failures

```bash
# Verify webhook URL is correct
# Check webhook signing secret
# Review Stripe dashboard for errors
```

## Scaling Considerations

### Database

- Enable connection pooling (Prisma Data Proxy or PgBouncer)
- Add read replicas for heavy read workloads
- Implement database indexes (already in schema)

### Redis

- Upgrade Upstash plan for more connections
- Consider Redis Cluster for high availability

### Vercel

- Upgrade to Pro for better performance
- Enable Edge Functions for global distribution
- Use Vercel Analytics for insights

## Security Checklist

- [ ] All environment variables are secret
- [ ] NEXTAUTH_SECRET is strong and random
- [ ] Database has strong password
- [ ] Stripe is in live mode (not test)
- [ ] CORS is properly configured
- [ ] Rate limiting is enabled
- [ ] SQL injection protection (Prisma handles this)
- [ ] XSS protection (React handles this)

## Backup Strategy

### Database Backups

- **Supabase**: Automatic daily backups
- **Railway**: Enable automatic backups
- **Neon**: Point-in-time recovery available

### Manual Backup

```bash
# Export database
pg_dump $DATABASE_URL > backup.sql

# Restore database
psql $DATABASE_URL < backup.sql
```

## Performance Optimization

1. **Enable caching**: Redis is already configured
2. **Optimize images**: Use Next.js Image component
3. **Enable CDN**: Vercel provides this automatically
4. **Database queries**: Use Prisma's query optimization
5. **API routes**: Implement rate limiting

## Support

For issues:
1. Check Vercel logs
2. Review database logs
3. Check Stripe dashboard
4. Review Redis metrics
5. Contact support if needed

---

**Congratulations!** Your booking system is now live! 🎉

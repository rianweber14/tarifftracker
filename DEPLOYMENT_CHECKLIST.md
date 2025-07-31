# Deployment Checklist for AITariffTracker Paywall

Use this checklist to ensure proper deployment of your Stripe paywall system.

## ✅ Pre-Deployment Setup

### Supabase Setup
- [ ] Create Supabase project
- [ ] Run `supabase-setup.sql` in SQL Editor
- [ ] Copy Project URL
- [ ] Copy Anon/Public Key
- [ ] Copy Service Role Key
- [ ] Test database connection

### Stripe Setup
- [ ] Create Stripe account (or use existing)
- [ ] Switch to Test Mode
- [ ] Create Basic plan product ($19/month, $190/year)
- [ ] Create Professional plan product ($49/month, $490/year)
- [ ] Create Enterprise plan product ($199/month, $1,990/year)
- [ ] Copy all Price IDs
- [ ] Copy Publishable Key
- [ ] Copy Secret Key
- [ ] Set up webhook endpoint (will be configured after Netlify deployment)

## ✅ Code Configuration

### Update Authentication
- [ ] Replace `YOUR_SUPABASE_URL` in `auth.js`
- [ ] Replace `YOUR_SUPABASE_ANON_KEY` in `auth.js`

### Update Checkout Configuration
- [ ] Replace `pk_test_YOUR_STRIPE_PUBLISHABLE_KEY` in `checkout.html`
- [ ] Update all Price IDs in the `plans` object in `checkout.html`
- [ ] Verify pricing amounts match your Stripe products

### Verify File Structure
- [ ] All HTML files are present
- [ ] All Netlify functions are in `netlify/functions/` directory
- [ ] `netlify.toml` configuration is correct
- [ ] `package.json` includes required dependencies

## ✅ Netlify Deployment

### Initial Deployment
- [ ] Connect Git repository to Netlify
- [ ] Set build command: `npm install` (or leave empty for static site)
- [ ] Set publish directory: `.` (root directory)
- [ ] Deploy site

### Environment Variables Setup
Go to Site Settings > Environment Variables and add:

- [ ] `STRIPE_SECRET_KEY` = `sk_test_...` (your Stripe secret key)
- [ ] `STRIPE_PUBLISHABLE_KEY` = `pk_test_...` (your Stripe publishable key)
- [ ] `STRIPE_WEBHOOK_SECRET` = `whsec_...` (will be set after webhook creation)
- [ ] `SUPABASE_URL` = `https://your-project.supabase.co`
- [ ] `SUPABASE_SERVICE_KEY` = `eyJh...` (your Supabase service role key)
- [ ] `SUPABASE_ANON_KEY` = `eyJh...` (your Supabase anon key)
- [ ] `URL` = `https://your-site.netlify.app` (your Netlify site URL)

### Redeploy After Environment Variables
- [ ] Trigger new deployment to load environment variables
- [ ] Verify all functions deploy successfully
- [ ] Check function logs for any errors

## ✅ Stripe Webhook Configuration

### Create Webhook
- [ ] Go to Stripe Dashboard > Developers > Webhooks
- [ ] Click "Add endpoint"
- [ ] Enter endpoint URL: `https://your-site.netlify.app/.netlify/functions/stripe-webhook`
- [ ] Select events:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.created`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
  - [ ] `invoice.payment_succeeded`
  - [ ] `invoice.payment_failed`
- [ ] Save webhook
- [ ] Copy webhook signing secret
- [ ] Add `STRIPE_WEBHOOK_SECRET` to Netlify environment variables
- [ ] Redeploy site

## ✅ Testing Phase

### User Authentication Testing
- [ ] Test user registration
- [ ] Test email verification (if enabled)
- [ ] Test user login
- [ ] Test logout functionality
- [ ] Test password reset (if enabled)

### Subscription Flow Testing
- [ ] Test Basic plan subscription with test card `4242 4242 4242 4242`
- [ ] Test Professional plan subscription
- [ ] Test Enterprise plan subscription
- [ ] Test failed payment with test card `4000 0000 0000 0002`
- [ ] Verify webhook processing in Stripe dashboard
- [ ] Check subscription data in Supabase database

### Content Access Testing
- [ ] Test free content access (logged-in users)
- [ ] Test Basic tier content access
- [ ] Test Professional tier content access
- [ ] Test Enterprise tier content access
- [ ] Test content protection for non-subscribers
- [ ] Test upgrade prompts display correctly

### Subscription Management Testing
- [ ] Test customer portal access
- [ ] Test subscription upgrade
- [ ] Test subscription downgrade
- [ ] Test subscription cancellation
- [ ] Verify changes reflect in database

### Error Handling Testing
- [ ] Test behavior when logged out
- [ ] Test expired subscription handling
- [ ] Test network error scenarios
- [ ] Test invalid payment methods

## ✅ Production Preparation

### Switch to Live Mode
- [ ] Switch Stripe account to Live Mode
- [ ] Create live products and prices (same structure as test)
- [ ] Update environment variables with live Stripe keys
- [ ] Update webhook endpoint to use live keys
- [ ] Test with real payment method (small amount)

### Security Review
- [ ] Verify all environment variables are secure
- [ ] Check Supabase RLS policies are enabled
- [ ] Review function permissions
- [ ] Ensure no test data in production database

### Performance Optimization
- [ ] Test site loading speed
- [ ] Verify function cold start times
- [ ] Check image optimization
- [ ] Test mobile responsiveness

## ✅ Launch Checklist

### Final Verification
- [ ] All test transactions completed successfully
- [ ] All content tiers working correctly
- [ ] Customer portal functioning
- [ ] Email notifications working (if implemented)
- [ ] Analytics tracking setup (if desired)

### Monitoring Setup
- [ ] Set up Stripe webhook monitoring
- [ ] Configure Netlify function alerts
- [ ] Set up Supabase monitoring
- [ ] Create backup procedures

### Documentation
- [ ] Document admin procedures
- [ ] Create customer support guidelines
- [ ] Document troubleshooting steps
- [ ] Create user onboarding materials

## ✅ Post-Launch

### First Week
- [ ] Monitor subscription conversions
- [ ] Check for any error reports
- [ ] Verify webhook delivery success rates
- [ ] Monitor function performance

### Ongoing Maintenance
- [ ] Regular backup of Supabase data
- [ ] Monitor Stripe dashboard for issues
- [ ] Review and update pricing as needed
- [ ] Update content and features based on user feedback

## 🚨 Emergency Contacts

Keep these handy for troubleshooting:

- **Netlify Support**: [netlify.com/support](https://netlify.com/support)
- **Stripe Support**: [support.stripe.com](https://support.stripe.com)
- **Supabase Support**: [supabase.com/support](https://supabase.com/support)

## 📊 Success Metrics to Track

- [ ] Subscription conversion rate
- [ ] Customer churn rate
- [ ] Average revenue per user (ARPU)
- [ ] Function error rates
- [ ] Page load times
- [ ] Customer support tickets

---

**Note**: Keep this checklist updated as you make changes to your implementation. Each checkbox represents a critical step that should not be skipped.


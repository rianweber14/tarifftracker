# AITariffTracker Stripe Paywall Implementation

This is a complete Stripe paywall implementation for your AITariffTracker.com site using Supabase Auth and Netlify Functions. This solution minimizes development time while providing a robust, scalable subscription system.

## 🚀 Quick Start

### Prerequisites
- Netlify account
- Stripe account (test mode for development)
- Supabase account
- Git repository connected to Netlify

### 1. Set Up Supabase

1. **Create a new Supabase project** at [supabase.com](https://supabase.com)
2. **Run the database setup**:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the contents of `supabase-setup.sql`
   - Run the SQL commands
3. **Get your Supabase credentials**:
   - Project URL: `https://your-project.supabase.co`
   - Anon/Public Key: Found in Settings > API
   - Service Role Key: Found in Settings > API (keep this secret!)

### 2. Set Up Stripe

1. **Create Stripe products and prices**:
   - Go to your Stripe Dashboard > Products
   - Create three products with the following pricing:

   **Basic Plan:**
   - Monthly: $19/month (recurring)
   - Annual: $190/year (recurring)

   **Professional Plan:**
   - Monthly: $49/month (recurring)
   - Annual: $490/year (recurring)

   **Enterprise Plan:**
   - Monthly: $199/month (recurring)
   - Annual: $1,990/year (recurring)

2. **Copy the Price IDs** from each product (you'll need these for the checkout page)

3. **Set up webhook endpoint**:
   - Go to Developers > Webhooks
   - Add endpoint: `https://your-site.netlify.app/.netlify/functions/stripe-webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_succeeded`, `invoice.payment_failed`
   - Copy the webhook signing secret

### 3. Configure Your Code

1. **Update `auth.js`**:
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```

2. **Update `checkout.html`**:
   ```javascript
   const stripe = Stripe('pk_test_your-stripe-publishable-key');
   
   // Update the plans object with your actual Stripe Price IDs
   const plans = {
     basic: {
       monthly: { priceId: 'price_your_basic_monthly_id', amount: 19 },
       annual: { priceId: 'price_your_basic_annual_id', amount: 190 }
     },
     // ... update other plans
   };
   ```

### 4. Deploy to Netlify

1. **Set environment variables** in Netlify (Site Settings > Environment Variables):
   ```
   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_KEY=your_supabase_service_key
   SUPABASE_ANON_KEY=your_supabase_anon_key
   URL=https://your-site.netlify.app
   ```

2. **Deploy your site**:
   - Connect your Git repository to Netlify
   - Deploy the site
   - Verify all functions are working

### 5. Test Your Implementation

1. **Test user registration**: Create a test account
2. **Test subscription flow**: Subscribe using Stripe test card `4242 4242 4242 4242`
3. **Test content access**: Verify tier-based content protection
4. **Test subscription management**: Use the customer portal

## 📁 File Structure

```
paywall-implementation/
├── index.html              # Main landing page
├── login.html              # User login page
├── signup.html             # User registration page
├── checkout.html           # Subscription checkout page
├── account.html            # Account management page
├── protected-data.html     # Tier-based protected content
├── success.html            # Payment success page
├── auth.js                 # Authentication helper functions
├── package.json            # Dependencies
├── netlify.toml           # Netlify configuration
├── supabase-setup.sql     # Database schema
├── netlify/functions/
│   ├── create-checkout-session.js    # Stripe checkout
│   ├── stripe-webhook.js             # Webhook handler
│   ├── check-subscription.js         # Subscription verification
│   ├── create-portal-session.js      # Customer portal
│   └── verify-subscription-access.js # Content access control
└── README.md              # This file
```

## 💰 Subscription Tiers

### Basic Tier - $19/month or $190/year
- Current AI tariff rates
- 6 months historical data
- Basic visualizations
- CSV exports
- Weekly email updates

### Professional Tier - $49/month or $490/year
- All Basic features
- 3+ years historical data
- Advanced filtering tools
- Multiple export formats
- Daily alerts
- Priority support

### Enterprise Tier - $199/month or $1,990/year
- All Professional features
- Complete historical database
- API access
- Custom integrations
- Quarterly strategy sessions
- Dedicated support

## 🔧 Customization

### Adding New Content Tiers
1. Update the `verify-subscription-access.js` function
2. Add new content sections to `protected-data.html`
3. Update the access verification logic

### Modifying Pricing
1. Update Stripe products and prices
2. Update the `plans` object in `checkout.html`
3. Update the pricing display on your pages

### Adding Features
- Email notifications: Use Supabase Edge Functions
- Analytics: Add tracking to your functions
- Admin dashboard: Create admin-only pages

## 🛠️ Troubleshooting

### Common Issues

**Subscription not created after payment:**
- Check webhook endpoint is correct
- Verify webhook secret in environment variables
- Check Netlify function logs

**Content protection not working:**
- Verify Supabase RLS policies are enabled
- Check user authentication status
- Verify subscription data in database

**Stripe checkout not working:**
- Verify Stripe publishable key is correct
- Check Price IDs match your Stripe products
- Ensure test mode is enabled for testing

### Debugging

1. **Check Netlify function logs**: Netlify Dashboard > Functions > View logs
2. **Check Supabase logs**: Supabase Dashboard > Logs
3. **Check Stripe webhook logs**: Stripe Dashboard > Webhooks > View logs
4. **Browser console**: Check for JavaScript errors

## 🚀 Going Live

### Production Checklist

1. **Switch to Stripe live mode**:
   - Update environment variables with live keys
   - Update webhook endpoint to production URL
   - Test with real payment methods

2. **Update Supabase settings**:
   - Configure email templates
   - Set up proper authentication policies
   - Enable email confirmations if desired

3. **Performance optimization**:
   - Enable Netlify caching
   - Optimize images and assets
   - Monitor function performance

4. **Security**:
   - Review RLS policies
   - Audit environment variables
   - Set up monitoring and alerts

## 📞 Support

For issues with this implementation:
1. Check the troubleshooting section above
2. Review Netlify function logs
3. Check Stripe webhook delivery logs
4. Verify Supabase database state

## 🔄 Updates and Maintenance

### Regular Tasks
- Monitor subscription metrics in Stripe
- Review failed payments and retry logic
- Update content and pricing as needed
- Monitor function performance and costs

### Scaling Considerations
- Consider Netlify Pro for higher function limits
- Implement caching for frequently accessed data
- Add monitoring and alerting for critical functions

This implementation provides a solid foundation for your subscription business while minimizing development complexity and maintenance overhead.


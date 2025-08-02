// netlify/functions/create-checkout-session.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  console.log('=== CHECKOUT SESSION DEBUG START ===');
  console.log('HTTP Method:', event.httpMethod);
  console.log('Headers:', JSON.stringify(event.headers, null, 2));
  console.log('Body:', event.body);

  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    console.log('ERROR: Method not allowed');
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse request body
    console.log('Step 1: Parsing request body...');
    const { priceId, plan } = JSON.parse(event.body);
    console.log('Parsed data:', { priceId, plan });
    
    if (!priceId || !plan) {
      console.log('ERROR: Missing required parameters');
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required parameters' })
      };
    }

    // Get user from token
    console.log('Step 2: Getting authorization token...');
    const token = event.headers.authorization?.replace('Bearer ', '');
    console.log('Token present:', !!token);
    console.log('Token length:', token ? token.length : 0);
    
    if (!token) {
      console.log('ERROR: No authorization token');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Authorization required' })
      };
    }

    // Check environment variables
    console.log('Step 3: Checking environment variables...');
    console.log('SUPABASE_URL present:', !!process.env.SUPABASE_URL);
    console.log('SUPABASE_SERVICE_KEY present:', !!process.env.SUPABASE_SERVICE_KEY);
    console.log('STRIPE_SECRET_KEY present:', !!process.env.STRIPE_SECRET_KEY);

    // Initialize Supabase client
    console.log('Step 4: Initializing Supabase client...');
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    console.log('Supabase client created');

    // Get user from token
    console.log('Step 5: Getting user from token...');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    console.log('User data:', user ? { id: user.id, email: user.email } : null);
    console.log('User error:', userError);
    
    if (userError || !user) {
      console.log('ERROR: Invalid token or user not found');
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid token', details: userError?.message })
      };
    }

    // Check if customer already exists in Stripe
    console.log('Step 6: Checking for existing Stripe customer...');
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });
    console.log('Existing customers found:', existingCustomers.data.length);

    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
      console.log('Using existing customer:', customer.id);
    } else {
      // Create new customer
      console.log('Step 7: Creating new Stripe customer...');
      customer = await stripe.customers.create({
        email: user.email,
        metadata: {
          supabase_user_id: user.id
        }
      });
      console.log('Created new customer:', customer.id);
    }

    // Create checkout session
    console.log('Step 8: Creating checkout session...');
    const sessionData = {
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `https://aitarifftracker.com/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `https://aitarifftracker.com/checkout.html`,
      metadata: {
        user_id: user.id,
        plan: plan
      },
      subscription_data: {
        metadata: {
          user_id: user.id,
          plan: plan
        }
      }
    };
    console.log('Session data:', JSON.stringify(sessionData, null, 2));

    const session = await stripe.checkout.sessions.create(sessionData);
    console.log('Session created successfully:', session.id);

    console.log('=== CHECKOUT SESSION DEBUG SUCCESS ===');
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ sessionId: session.id })
    };
  } catch (error) {
    console.error('=== CHECKOUT SESSION DEBUG ERROR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('=== END DEBUG ERROR ===');
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Failed to create checkout session',
        details: error.message 
      })
    };
  }
};


// netlify/functions/verify-subscription-access.js
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { 
      statusCode: 405, 
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Parse the request body
    const { contentType, resourceId } = JSON.parse(event.body);
    
    // Check for authorization
    const token = event.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Authorization required', access: false })
      };
    }
    
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    // Get user from token
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);
    
    if (userError || !user) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid token', access: false })
      };
    }
    
    // Get subscription data
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('plan_type, status, current_period_end')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .single();
    
    // Determine access based on content type and subscription
    let hasAccess = false;
    let userPlan = 'free';
    
    if (subscription) {
      // Check if subscription is still valid (not expired)
      const now = Math.floor(Date.now() / 1000);
      if (subscription.current_period_end > now) {
        userPlan = subscription.plan_type;
        
        switch (subscription.plan_type) {
          case 'basic':
            hasAccess = ['free', 'basic'].includes(contentType);
            break;
          case 'professional':
            hasAccess = ['free', 'basic', 'professional'].includes(contentType);
            break;
          case 'enterprise':
            hasAccess = true; // Enterprise has access to everything
            break;
          default:
            hasAccess = contentType === 'free';
        }
      } else {
        // Subscription expired, treat as free user
        hasAccess = contentType === 'free';
      }
    } else {
      // Free user
      hasAccess = contentType === 'free';
    }
    
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        access: hasAccess,
        plan: userPlan,
        contentType: contentType,
        subscriptionValid: subscription && subscription.current_period_end > Math.floor(Date.now() / 1000)
      })
    };
  } catch (error) {
    console.error('Error verifying subscription access:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to verify access', access: false })
    };
  }
};


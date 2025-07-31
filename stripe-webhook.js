// netlify/functions/stripe-webhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig = event.headers['stripe-signature'];
  let stripeEvent;

  try {
    // Verify webhook signature
    stripeEvent = stripe.webhooks.constructEvent(
      event.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    return {
      statusCode: 400,
      body: JSON.stringify({ error: `Webhook Error: ${error.message}` })
    };
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      process.env.SUPABASE_URL,
      process.env.SUPABASE_SERVICE_KEY
    );
    
    // Handle the event
    switch (stripeEvent.type) {
      case 'checkout.session.completed': {
        const session = stripeEvent.data.object;
        
        // Get user ID from metadata
        const userId = session.metadata.user_id;
        const plan = session.metadata.plan;
        
        if (!userId || !plan) {
          console.error('Missing user_id or plan in session metadata');
          break;
        }
        
        // Create or update subscription in Supabase
        const { error } = await supabase
          .from('subscriptions')
          .upsert({
            user_id: userId,
            stripe_customer_id: session.customer,
            stripe_subscription_id: session.subscription,
            plan_type: plan,
            status: 'active',
            current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days from now
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'user_id'
          });
        
        if (error) {
          console.error('Error creating subscription:', error);
        } else {
          console.log('Subscription created for user:', userId);
        }
        break;
      }
      
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = stripeEvent.data.object;
        
        // Find subscription in Supabase by stripe_subscription_id
        const { data: existingSubscription, error: findError } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_subscription_id', subscription.id)
          .single();
        
        if (findError && findError.code !== 'PGRST116') {
          console.error('Error finding subscription:', findError);
          break;
        }
        
        if (existingSubscription) {
          // Update existing subscription
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: subscription.status,
              current_period_end: subscription.current_period_end,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', subscription.id);
          
          if (error) {
            console.error('Error updating subscription:', error);
          } else {
            console.log('Subscription updated:', subscription.id);
          }
        }
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = stripeEvent.data.object;
        
        // Update subscription status to canceled
        const { error } = await supabase
          .from('subscriptions')
          .update({ 
            status: 'canceled',
            updated_at: new Date().toISOString()
          })
          .eq('stripe_subscription_id', subscription.id);
        
        if (error) {
          console.error('Error canceling subscription:', error);
        } else {
          console.log('Subscription canceled:', subscription.id);
        }
        break;
      }
      
      case 'invoice.payment_succeeded': {
        const invoice = stripeEvent.data.object;
        
        // Update subscription period end date
        if (invoice.subscription) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              current_period_end: invoice.period_end,
              updated_at: new Date().toISOString()
            })
            .eq('stripe_subscription_id', invoice.subscription);
          
          if (error) {
            console.error('Error updating subscription period:', error);
          }
        }
        break;
      }
      
      case 'invoice.payment_failed': {
        const invoice = stripeEvent.data.object;
        
        // Optionally handle failed payments
        console.log('Payment failed for subscription:', invoice.subscription);
        break;
      }
      
      default:
        console.log(`Unhandled event type ${stripeEvent.type}`);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
  } catch (error) {
    console.error('Error processing webhook:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Webhook Error: ${error.message}` })
    };
  }
};


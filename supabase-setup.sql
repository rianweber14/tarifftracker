-- Supabase Database Setup for AITariffTracker Paywall
-- Run these SQL commands in your Supabase SQL editor

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    plan_type TEXT NOT NULL CHECK (plan_type IN ('basic', 'professional', 'enterprise')),
    status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'unpaid')),
    current_period_end INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_subscription_id ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Enable Row Level Security (RLS)
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only read their own subscription data
CREATE POLICY "Users can view own subscription" ON public.subscriptions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own subscription data (for metadata updates)
CREATE POLICY "Users can update own subscription" ON public.subscriptions
    FOR UPDATE USING (auth.uid() = user_id);

-- Service role can do everything (for webhook processing)
CREATE POLICY "Service role can manage all subscriptions" ON public.subscriptions
    FOR ALL USING (auth.role() = 'service_role');

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_subscriptions_updated_at 
    BEFORE UPDATE ON public.subscriptions 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Optional: Create a view for active subscriptions
CREATE OR REPLACE VIEW public.active_subscriptions AS
SELECT 
    s.*,
    u.email,
    u.created_at as user_created_at
FROM public.subscriptions s
JOIN auth.users u ON s.user_id = u.id
WHERE s.status = 'active' 
AND s.current_period_end > EXTRACT(EPOCH FROM NOW());

-- Grant permissions
GRANT SELECT ON public.active_subscriptions TO authenticated;
GRANT SELECT ON public.active_subscriptions TO service_role;

-- Optional: Create a function to check subscription access
CREATE OR REPLACE FUNCTION public.check_subscription_access(content_type TEXT)
RETURNS BOOLEAN AS $$
DECLARE
    user_subscription RECORD;
BEGIN
    -- Get current user's subscription
    SELECT plan_type, status, current_period_end
    INTO user_subscription
    FROM public.subscriptions
    WHERE user_id = auth.uid() 
    AND status = 'active'
    AND current_period_end > EXTRACT(EPOCH FROM NOW());
    
    -- If no active subscription, only allow free content
    IF user_subscription IS NULL THEN
        RETURN content_type = 'free';
    END IF;
    
    -- Check access based on plan type
    CASE user_subscription.plan_type
        WHEN 'basic' THEN
            RETURN content_type IN ('free', 'basic');
        WHEN 'professional' THEN
            RETURN content_type IN ('free', 'basic', 'professional');
        WHEN 'enterprise' THEN
            RETURN TRUE; -- Enterprise has access to everything
        ELSE
            RETURN content_type = 'free';
    END CASE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.check_subscription_access(TEXT) TO authenticated;


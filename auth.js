// auth.js - Supabase Authentication Helper
// Replace these with your actual Supabase credentials
const SUPABASE_URL = 'https://pivmsxrdzwwxrbmnllmh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpdm1zeHJkend3eHJibW5sbG1oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4OTI3OTcsImV4cCI6MjA2OTQ2ODc5N30.hPbvjGlmLHsEgW_mUGfpIOymzfwR8qsM3hVKp3DShVQ';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Authentication functions
async function signUp(email, password) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message };
  }
}

async function signIn(email, password) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });
    
    if (error) throw error;
    
    return { success: true, data };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
}

async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw error;
    
    // Redirect to home page after logout
    window.location.href = '/';
    
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
}

async function getCurrentUser() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Get user error:', error);
    return null;
  }
}

async function getSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Get session error:', error);
    return null;
  }
}

async function checkSubscription() {
  try {
    const session = await getSession();
    
    if (!session) {
      return null;
    }
    
    const response = await fetch('/.netlify/functions/check-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to check subscription');
    }
    
    const data = await response.json();
    return data.subscription;
  } catch (error) {
    console.error('Check subscription error:', error);
    return null;
  }
}

// Listen for auth state changes
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Auth state changed:', event, session);
  
  if (event === 'SIGNED_IN') {
    // User signed in
    updateAuthUI(true, session.user);
  } else if (event === 'SIGNED_OUT') {
    // User signed out
    updateAuthUI(false, null);
  }
});

// Update UI based on auth state
function updateAuthUI(isLoggedIn, user) {
  const loggedOutElements = document.querySelectorAll('.logged-out-only');
  const loggedInElements = document.querySelectorAll('.logged-in-only');
  
  if (isLoggedIn) {
    loggedOutElements.forEach(el => el.style.display = 'none');
    loggedInElements.forEach(el => el.style.display = 'block');
    
    // Update user info
    document.querySelectorAll('.user-email').forEach(el => {
      el.textContent = user.email;
    });
  } else {
    loggedOutElements.forEach(el => el.style.display = 'block');
    loggedInElements.forEach(el => el.style.display = 'none');
  }
}

// Initialize auth state on page load
document.addEventListener('DOMContentLoaded', async () => {
  const user = await getCurrentUser();
  updateAuthUI(!!user, user);
});


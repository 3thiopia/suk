import { getSupabaseClient, isSupabaseConfigured } from './client';
import { User, UserRole } from '../../types';

export interface SignUpParams {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  phone: string;
  businessName?: string;
  avatarUrl?: string;
}

export interface AuthResult {
  user: User | null;
  error: string | null;
  needsEmailVerification?: boolean;
  needsOnboarding?: boolean;
}

/**
 * Normal Email/Password Sign Up using Supabase Auth.
 * Passwords are sent directly to Supabase Auth and NEVER stored locally or in profile tables.
 */
export async function signUpWithSupabase(params: SignUpParams): Promise<AuthResult> {
  // Enforce role security: Admin cannot be created via public signup
  if (params.role === 'admin') {
    return { user: null, error: 'Administrator accounts cannot be created via public registration.' };
  }

  const client = getSupabaseClient();
  
  if (!client) {
    // If Supabase is not configured in client env, perform structured local account creation
    return { user: null, error: 'Supabase authentication service is not configured.' };
  }

  const { data, error } = await client.auth.signUp({
    email: params.email.trim().toLowerCase(),
    password: params.password,
    options: {
      data: {
        name: params.name.trim(),
        full_name: params.name.trim(),
        role: params.role,
        phone: params.phone.trim(),
        business_name: params.businessName?.trim() || '',
        avatar_url: params.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
      },
    },
  });

  if (error) {
    // Map raw error messages to user-friendly messages
    let msg = error.message;
    if (error.message.toLowerCase().includes('already registered')) {
      msg = 'An account with this email address already exists. Please sign in instead.';
    } else if (error.message.toLowerCase().includes('weak password') || error.message.toLowerCase().includes('password should be at least')) {
      msg = 'Password is too weak. Please use at least 8 characters with numbers and letters.';
    }
    return { user: null, error: msg };
  }

  if (data.user) {
    // Check if user session was created or email verification is required
    if (!data.session) {
      return {
        user: null,
        error: null,
        needsEmailVerification: true,
      };
    }

    // Try fetching profile created by trigger or manual insert
    const { data: profile } = await (client.from('profiles') as any)
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profile) {
      const user: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        phone: profile.phone || undefined,
        role: profile.role as UserRole,
        avatarUrl: profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        createdAt: profile.created_at,
        status: profile.status as any,
      };
      return { user, error: null };
    }
  }

  return {
    user: null,
    error: null,
    needsEmailVerification: true,
  };
}

/**
 * Email/Password Sign In using Supabase Auth.
 */
export async function signInWithSupabase(
  email: string,
  password: string
): Promise<AuthResult> {
  const client = getSupabaseClient();
  if (!client) {
    return { user: null, error: 'Supabase authentication is not configured.' };
  }

  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) {
    let friendlyError = 'Invalid email address or password. Please try again.';
    if (error.message.toLowerCase().includes('email not confirmed')) {
      friendlyError = 'Your email address has not been verified yet. Please check your inbox for the verification email.';
    } else if (error.message.toLowerCase().includes('invalid login credentials')) {
      friendlyError = 'Incorrect email or password. Please verify your credentials or reset your password.';
    }
    return { user: null, error: friendlyError };
  }

  if (data.user) {
    const { data: profile } = await (client.from('profiles') as any)
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profile) {
      if (profile.status === 'banned' || profile.status === 'suspended') {
        await client.auth.signOut();
        return { user: null, error: 'Your account has been suspended. Please contact SUK support.' };
      }

      const user: User = {
        id: profile.id,
        email: profile.email,
        name: profile.name,
        phone: profile.phone || undefined,
        role: profile.role as UserRole,
        avatarUrl: profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        createdAt: profile.created_at,
        status: profile.status as any,
      };
      return { user, error: null };
    }
  }

  return { user: null, error: 'User profile record not found.' };
}

/**
 * Initiate Social OAuth Sign In (Google)
 */
export async function signInWithGoogle(): Promise<{ error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { error: 'Supabase client is not configured for OAuth.' };
  }

  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/`,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { error: null };
}

/**
 * Send password reset email via Supabase Auth
 */
export async function resetPasswordForEmail(email: string): Promise<{ success: boolean; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase authentication service is unavailable.' };
  }

  const { error } = await client.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Update authenticated user's password (used in password reset flow)
 */
export async function updatePasswordWithSupabase(newPassword: string): Promise<{ success: boolean; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { success: false, error: 'Supabase authentication service is unavailable.' };
  }

  const { error } = await client.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

/**
 * Sign out completely from Supabase session
 */
export async function signOutSupabase(): Promise<{ error: string | null }> {
  const client = getSupabaseClient();
  if (!client) return { error: null };
  const { error } = await client.auth.signOut();
  return { error: error ? error.message : null };
}

/**
 * Get active authenticated Supabase session user & profile
 */
export async function getCurrentSupabaseUser(): Promise<User | null> {
  const client = getSupabaseClient();
  if (!client) return null;

  const { data: { session } } = await client.auth.getSession();
  if (!session?.user) return null;

  const { data: profile } = await (client.from('profiles') as any)
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (!profile) return null;

  return {
    id: profile.id,
    email: profile.email,
    name: profile.name,
    phone: profile.phone || undefined,
    role: profile.role as UserRole,
    avatarUrl: profile.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
    createdAt: profile.created_at,
    status: profile.status as any,
  };
}


import { getSupabaseClient, isSupabaseConfigured } from './client';
import { User, UserRole } from '../../types';

export async function signUpWithSupabase(params: {
  email: string;
  password?: string;
  name: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
}): Promise<{ user: User | null; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { user: null, error: 'Supabase client is not configured.' };
  }

  const pwd = params.password || 'SukPassword2026!';

  const { data, error } = await client.auth.signUp({
    email: params.email,
    password: pwd,
    options: {
      data: {
        name: params.name,
        full_name: params.name,
        role: params.role,
        avatar_url: params.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
        phone: params.phone || '',
      },
    },
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (data.user) {
    // Fetch profile
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

  return { user: null, error: 'User created successfully. Please check your email to confirm registration.' };
}

export async function signInWithSupabase(
  email: string,
  password?: string
): Promise<{ user: User | null; error: string | null }> {
  const client = getSupabaseClient();
  if (!client) {
    return { user: null, error: 'Supabase is not configured.' };
  }

  const pwd = password || 'SukPassword2026!';
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password: pwd,
  });

  if (error) {
    return { user: null, error: error.message };
  }

  if (data.user) {
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

  return { user: null, error: 'Profile record not found.' };
}

export async function signOutSupabase(): Promise<{ error: string | null }> {
  const client = getSupabaseClient();
  if (!client) return { error: null };
  const { error } = await client.auth.signOut();
  return { error: error ? error.message : null };
}

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

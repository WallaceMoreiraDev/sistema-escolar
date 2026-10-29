import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { UserProfileDTO } from '@shared/types';
import { authApi } from '../api/authApi';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface AuthContextType {
  session: Session | null;
  user: UserProfileDTO | null | undefined;
  isLoading: boolean;
  isError: boolean;
  error: unknown;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isError: false,
  error: null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsInitializing(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const {
    data: user,
    isLoading: isUserLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['me', session?.access_token],
    queryFn: () => authApi.getMe(session!.access_token),
    enabled: !!session?.access_token,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const signOut = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } finally {
      setSession(null);
      queryClient.clear();
    }
  }, [queryClient]);

  const isLoading = isInitializing || (!!session && isUserLoading);

  return (
    <AuthContext.Provider value={{ session, user, isLoading, isError, error, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

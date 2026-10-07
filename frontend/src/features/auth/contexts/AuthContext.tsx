import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../../../lib/supabase';
import { UserSessionData, authApi } from '../api/authApi';
import { useQuery } from '@tanstack/react-query';

interface AuthContextType {
  session: Session | null;
  user: UserSessionData | null | undefined;
  isLoading: boolean;
  isError: boolean;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isLoading: true,
  isError: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

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

  const { data: user, isLoading: isUserLoading, isError } = useQuery({
    queryKey: ['me', session?.access_token],
    queryFn: () => authApi.getMe(session!.access_token),
    enabled: !!session?.access_token,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const isLoading = isInitializing || (!!session && isUserLoading);

  return (
    <AuthContext.Provider value={{ session, user, isLoading, isError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

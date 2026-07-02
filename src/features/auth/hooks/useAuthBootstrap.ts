import { useEffect } from 'react';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { supabase } from '@/shared/lib/supabase';
import {
  isDevBypassEnabled,
  getDevMockSession,
  getDevMockProfile,
} from '@/shared/lib/dev-bypass';

export function useAuthBootstrap() {
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setHydrated = useAuthStore((s) => s.setHydrated);

  useEffect(() => {
    if (isDevBypassEnabled()) {
      setSession(getDevMockSession());
      setProfile(getDevMockProfile());
      setHydrated(true);
      return;
    }

    const initAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session) {
          setSession(session);

          const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileData) {
            setProfile(profileData);
          }
        }
      } finally {
        setHydrated(true);
      }
    };

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);

      if (session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setProfile(profileData ?? null);
      } else {
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setSession, setProfile, setHydrated]);
}

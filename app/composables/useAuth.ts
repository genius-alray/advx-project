interface LoginResponse {
  message: string;
  user: {
    id: string;
    name: string;
  };
}

interface RegisterResponse {
  message: string;
}

/**
 * Authentication composable
 */
export const useAuth = () => {
  const pending = ref(false);
  const error = ref<string | null>(null);
  const user = ref<{ id: string; name: string } | null>(null);

  const { user: session, fetch: refreshSession } = useUserSession();

  watch(
    session,
    (newSession) => {
      user.value = newSession || null;
    },
    { immediate: true }
  );

  const login = async (credentials: {
    id: string;
    password: string;
  }): Promise<boolean> => {
    try {
      pending.value = true;
      error.value = null;

      const response = await $fetch<LoginResponse>("/api/user/login", {
        method: "POST",
        body: credentials,
      });

      if (response.user) {
        user.value = response.user;
        await refreshSession();
        return true;
      }

      return false;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Login failed";
      return false;
    } finally {
      pending.value = false;
    }
  };

  const register = async (userData: {
    id: string;
    name: string;
    password: string;
  }): Promise<boolean> => {
    try {
      pending.value = true;
      error.value = null;

      await $fetch<RegisterResponse>("/api/user/register", {
        method: "POST",
        body: userData,
      });

      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Registration failed";
      return false;
    } finally {
      pending.value = false;
    }
  };

  const logout = async (): Promise<boolean> => {
    try {
      pending.value = true;
      error.value = null;

      await $fetch("/api/auth/logout", {
        method: "POST",
      });

      user.value = null;
      await refreshSession();
      return true;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Logout failed";
      return false;
    } finally {
      pending.value = false;
    }
  };

  const isAuthenticated = computed(() => !!user.value);

  return {
    user: readonly(user),
    pending: readonly(pending),
    error: readonly(error),
    isAuthenticated,
    login,
    register,
    logout,
    refreshSession,
  };
};

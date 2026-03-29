import { useAuthStore } from "../store/authStore"
import { loginWithEmail, loginWithGoogle, logout, registerWithEmail } from "../firebase/auth"

export function useAuth() {
  const { user, loading } = useAuthStore()

  return {
    user,
    loading,
    isAuthenticated: !!user,
    loginWithEmail,
    loginWithGoogle,
    registerWithEmail,
    logout,
  }
}

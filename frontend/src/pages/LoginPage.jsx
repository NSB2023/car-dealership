import { useState, useEffect } from "react"
import { useNavigate, Link } from "react-router-dom"
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from "firebase/auth"
import { auth } from "../firebase/config"

const cn = (...classes) => classes.filter(Boolean).join(" ")

// ── Google Icon ──────────────────────────────────────────────────────────────
function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  )
}

// ── Input Field ──────────────────────────────────────────────────────────────
function InputField({ label, type = "text", value, onChange, placeholder, icon, error }) {
  const [showPass, setShowPass] = useState(false)
  const isPassword = type === "password"
  const inputType = isPassword ? (showPass ? "text" : "password") : type

  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-white/50 tracking-widest uppercase mb-2">
        {label}
      </label>
      <div className={cn(
        "relative flex items-center bg-white/5 border rounded-sm transition-all duration-200",
        error ? "border-red-500/50" : "border-white/10 focus-within:border-[#C9A84C]/60"
      )}>
        {icon && (
          <span className="pl-4 text-white/30 flex-shrink-0">{icon}</span>
        )}
        <input
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="w-full bg-transparent px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none"
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="pr-4 text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
          >
            {showPass ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && <p className="mt-1.5 text-xs text-red-400">{error}</p>}
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState("login") // "login" | "signup"
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [errors, setErrors] = useState({})
  const [firebaseError, setFirebaseError] = useState("")

  // Form state
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 80)
    return () => clearTimeout(t)
  }, [])

  const clearErrors = () => {
    setErrors({})
    setFirebaseError("")
  }

  const switchMode = (m) => {
    setMode(m)
    clearErrors()
    setName("")
    setEmail("")
    setPassword("")
    setConfirmPassword("")
  }

  const validate = () => {
    const errs = {}
    if (mode === "signup" && !name.trim()) errs.name = "Name is required"
    if (!email.trim()) errs.email = "Email is required"
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Enter a valid email"
    if (!password) errs.password = "Password is required"
    else if (password.length < 6) errs.password = "At least 6 characters"
    if (mode === "signup" && password !== confirmPassword)
      errs.confirmPassword = "Passwords do not match"
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const getFirebaseMessage = (code) => {
    const map = {
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password. Try again.",
      "auth/email-already-in-use": "An account with this email already exists.",
      "auth/too-many-requests": "Too many attempts. Please try again later.",
      "auth/invalid-credential": "Invalid email or password.",
      "auth/network-request-failed": "Network error. Check your connection.",
    }
    return map[code] || "Something went wrong. Please try again."
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    clearErrors()
    if (!validate()) return
    setLoading(true)
    try {
      if (mode === "login") {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        const { user } = await createUserWithEmailAndPassword(auth, email, password)
        await updateProfile(user, { displayName: name })
      }
      navigate("/")
    } catch (err) {
      setFirebaseError(getFirebaseMessage(err.code))
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setGoogleLoading(true)
    clearErrors()
    try {
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
      navigate("/")
    } catch (err) {
      setFirebaseError(getFirebaseMessage(err.code))
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] flex">
      {/* ── Left panel: branding ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1200&q=85"
            alt="Luxury car"
            className="w-full h-full object-cover"
            style={{ objectPosition: "center 30%" }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#080808]/95 via-[#080808]/70 to-[#080808]/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-transparent" />
        </div>

        {/* Left accent line */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-40 bg-gradient-to-b from-transparent via-[#C9A84C] to-transparent" />

        {/* Logo */}
        <div
          className={cn(
            "relative z-10 flex items-center gap-3 transition-all duration-700",
            loaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
          )}
        >
          <div className="w-9 h-9 bg-[#C9A84C] rounded-sm flex items-center justify-center">
            <span className="text-black font-bold text-sm">A</span>
          </div>
          <span className="text-white font-semibold tracking-widest text-sm uppercase">AutoLux</span>
        </div>

        {/* Middle quote */}
        <div className="relative z-10">
          <div
            className={cn(
              "flex items-center gap-3 mb-6 transition-all duration-700 delay-100",
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            <div className="h-px w-8 bg-[#C9A84C]" />
            <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase">Premium access</span>
          </div>
          <h2
            className={cn(
              "text-4xl font-bold text-white leading-tight mb-4 transition-all duration-700 delay-200",
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Your dream car
            <br />
            <span className="text-[#C9A84C] italic">awaits you</span>
          </h2>
          <p
            className={cn(
              "text-white/40 text-sm leading-relaxed max-w-sm transition-all duration-700 delay-300",
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            Sign in to save your favourite vehicles, track enquiries,
            and get personalised recommendations.
          </p>
        </div>

        {/* Bottom stats */}
        <div
          className={cn(
            "relative z-10 flex gap-8 transition-all duration-700 delay-400",
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
        >
          {[["2,400+", "Vehicles"], ["18", "Locations"], ["98%", "Satisfaction"]].map(([val, lbl]) => (
            <div key={lbl}>
              <div className="text-xl font-bold text-white">{val}</div>
              <div className="text-white/30 text-xs tracking-wide mt-0.5">{lbl}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right panel: form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 relative">
        {/* Subtle background texture */}
        <div className="absolute inset-0 bg-[#080808]">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#C9A84C]/3 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#C9A84C]/2 rounded-full blur-3xl" />
        </div>

        <div
          className={cn(
            "relative w-full max-w-md transition-all duration-700 delay-200",
            loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-8 h-8 bg-[#C9A84C] rounded-sm flex items-center justify-center">
              <span className="text-black font-bold text-sm">A</span>
            </div>
            <span className="text-white font-semibold tracking-widest text-sm uppercase">AutoLux</span>
          </div>

          {/* Mode toggle tabs */}
          <div className="flex bg-white/5 p-1 rounded-sm mb-8 border border-white/5">
            {["login", "signup"].map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={cn(
                  "flex-1 py-2.5 text-sm font-medium rounded-sm transition-all duration-200 tracking-wide capitalize",
                  mode === m
                    ? "bg-[#C9A84C] text-black"
                    : "text-white/40 hover:text-white/70"
                )}
              >
                {m === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1
              className="text-3xl font-bold text-white mb-2"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {mode === "login" ? "Welcome back" : "Join AutoLux"}
            </h1>
            <p className="text-white/40 text-sm">
              {mode === "login"
                ? "Sign in to access your account and saved vehicles."
                : "Create an account to save vehicles and get personalised deals."}
            </p>
          </div>

          {/* Google button */}
          <button
            onClick={handleGoogle}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white/80 hover:text-white py-3.5 rounded-sm text-sm font-medium transition-all duration-200 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {googleLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-white/25 text-xs tracking-widest uppercase">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate>
            {mode === "signup" && (
              <InputField
                label="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Smith"
                error={errors.name}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                  </svg>
                }
              />
            )}

            <InputField
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              error={errors.email}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
              }
            />

            <InputField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              error={errors.password}
              icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              }
            />

            {mode === "signup" && (
              <InputField
                label="Confirm password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                error={errors.confirmPassword}
                icon={
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                  </svg>
                }
              />
            )}

            {/* Forgot password */}
            {mode === "login" && (
              <div className="flex justify-end mb-5 -mt-2">
                <button
                  type="button"
                  className="text-xs text-white/35 hover:text-[#C9A84C] transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {/* Firebase error */}
            {firebaseError && (
              <div className="mb-4 flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-sm px-4 py-3">
                <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-red-400 text-sm">{firebaseError}</p>
              </div>
            )}

            {/* Submit button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#C9A84C] hover:bg-[#D4B86A] disabled:opacity-60 disabled:cursor-not-allowed text-black font-semibold py-4 rounded-sm text-sm tracking-wide transition-all duration-200 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : mode === "login" ? (
                "Sign in to AutoLux"
              ) : (
                "Create my account"
              )}
            </button>
          </form>

          {/* Switch mode link */}
          <p className="text-center text-white/35 text-sm mt-6">
            {mode === "login" ? "Don't have an account? " : "Already have an account? "}
            <button
              onClick={() => switchMode(mode === "login" ? "signup" : "login")}
              className="text-[#C9A84C] hover:text-[#D4B86A] font-medium transition-colors"
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </p>

          {/* Back to home */}
          <div className="text-center mt-8">
            <Link
              to="/"
              className="text-white/20 hover:text-white/50 text-xs tracking-wide transition-colors flex items-center justify-center gap-1.5"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
              </svg>
              Back to homepage
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
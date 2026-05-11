// CODE from Claude
import { useState, useEffect, useRef } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "../firebase/config"
import { Calculator, CalendarDays, Car, MapPin, Sparkles, X } from "lucide-react"

// ─── Utility ────────────────────────────────────────────────────────────────
const cn = (...classes) => classes.filter(Boolean).join(" ")

// ─── Mock data (replace with API calls) ─────────────────────────────────────
const FEATURED_CARS = [
  {
    id: 1,
    make: "BMW",
    model: "M5 Competition",
    year: 2024,
    price: 115000,
    mileage: 0,
    fuel: "Gasoline",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
    badge: "New Arrival",
    badgeColor: "gold",
  },
  {
    id: 2,
    make: "Mercedes-Benz",
    model: "GLE 63 AMG",
    year: 2024,
    price: 132000,
    mileage: 1200,
    fuel: "Hybrid",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
    badge: "Featured",
    badgeColor: "silver",
  },
  {
    id: 3,
    make: "Porsche",
    model: "Cayenne Turbo",
    year: 2023,
    price: 147500,
    mileage: 8400,
    fuel: "Gasoline",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
    badge: "Certified",
    badgeColor: "blue",
  },
  {
    id: 4,
    make: "Audi",
    model: "RS7 Sportback",
    year: 2024,
    price: 126900,
    mileage: 0,
    fuel: "Gasoline",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
    badge: "New Arrival",
    badgeColor: "gold",
  },
  {
    id: 5,
    make: "Lexus",
    model: "LC 500",
    year: 2023,
    price: 98500,
    mileage: 5200,
    fuel: "Gasoline",
    transmission: "Automatic",
    image: "https://images.unsplash.com/photo-1621993202323-01f0fd7d0f86?w=800&q=80",
    badge: "Certified",
    badgeColor: "blue",
  },
  {
    id: 6,
    make: "Tesla",
    model: "Model S Plaid",
    year: 2024,
    price: 108990,
    mileage: 0,
    fuel: "Electric",
    transmission: "Single-speed",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80",
    badge: "Electric",
    badgeColor: "green",
  },
]

// ─── UPDATED STATS ─────────────────────────────────────────────────────────
const STATS = [
  { value: 2400, suffix: "+", label: "Vehicles in stock" },
  { value: 18, suffix: "", label: "Dealership locations" },
  { value: 98, suffix: "%", label: "Customer satisfaction" },
  { value: 15, suffix: "yr", label: "In business" },
]

const MAKES = ["All Makes", "BMW", "Mercedes-Benz", "Porsche", "Audi", "Lexus", "Tesla", "Toyota", "Honda"]
const MODELS = ["All Models", "Sedan", "SUV", "Coupe", "Convertible", "Truck", "Van"]
const YEARS = ["Any Year", "2024", "2023", "2022", "2021", "2020", "2019 & older"]

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Number(value || 0))

const titleCase = (value) =>
  String(value || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())

const getCarDescription = (car) => {
  const descriptions = {
    1: "A precision-built executive sedan with immense pace, a tailored cabin, and a composed grand touring character.",
    2: "A high-performance luxury SUV with AMG power, hybrid assistance, and comfort that feels effortless over distance.",
    3: "A certified performance SUV with Porsche handling, generous practicality, and a quietly confident road presence.",
    4: "A dramatic sportback that combines quattro grip, grand touring refinement, and everyday usability.",
    5: "A sculptural luxury coupe with naturally aspirated character, elegant materials, and relaxed long-distance manners.",
    6: "A technology-forward electric flagship with instant response, quiet cruising, and premium daily usability.",
  }

  return descriptions[car.id] || "A curated AutoLux selection with verified details, premium presentation, and concierge support."
}



// ─── COUNTER COMPONENT ─────────────────────────────────────────────────────


function Counter({ target, suffix = "", duration = 2000 }) {
  const [count, setCount] = useState(0)
  const startTime = useRef(null)

  useEffect(() => {
    let animationFrame

    const updateCount = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp

      const progress = Math.min((timestamp - startTime.current) / duration, 1)

      // Smooth easing
      const eased = 1 - Math.pow(1 - progress, 3)

      const current = Math.floor(eased * target)
      setCount(current)

      if (progress < 1) {
        animationFrame = requestAnimationFrame(updateCount)
      }
    }

    animationFrame = requestAnimationFrame(updateCount)

    return () => cancelAnimationFrame(animationFrame)
  }, [target, duration])

  return (
    <span>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}


// ─── Sub-components ──────────────────────────────────────────────────────────

function Navbar({ onOpenFinance }) {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState(null)
  const [dropdownOpen, setDropdownOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u))
    return unsubscribe
  }, [])

  const handleSignOut = async () => {
    await signOut(auth)
    setDropdownOpen(false)
  }

  const getInitials = (u) => {
    if (u?.displayName) {
      return u.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    }
    return u?.email?.[0]?.toUpperCase() || "U"
  }

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled ? "bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 py-3" : "py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        {/* Logo */}
        <a href="/" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#C9A84C] rounded-sm flex items-center justify-center">
            <span className="text-black font-bold text-sm tracking-tighter">A</span>
          </div>
          <span className="text-white font-semibold tracking-widest text-sm uppercase">AutoLux</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {["Inventory", "Dealerships", "Finance", "About"].map((item) => (
            item === "Finance" ? (
              <button
                key={item}
                type="button"
                onClick={onOpenFinance}
                className="text-white/60 hover:text-white text-sm tracking-wide transition-colors duration-200"
              >
                {item}
              </button>
            ) : (
              <a
                key={item}
                href={item === "About" ? "#about" : `/${item.toLowerCase()}`}
                className="text-white/60 hover:text-white text-sm tracking-wide transition-colors duration-200"
              >
                {item}
              </a>
            )
          ))}
        </div>

        {/* CTA — auth aware */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 group"
              >
                <div className="w-8 h-8 rounded-sm bg-[#C9A84C] flex items-center justify-center text-black font-bold text-xs">
                  {getInitials(user)}
                </div>
                <span className="text-white/70 text-sm group-hover:text-white transition-colors max-w-[120px] truncate">
                  {user.displayName || user.email}
                </span>
                <svg className={cn("w-3 h-3 text-white/40 transition-transform", dropdownOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 top-12 w-48 bg-[#111] border border-white/10 rounded-sm shadow-2xl overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-white text-xs font-medium truncate">{user.displayName || "User"}</p>
                    <p className="text-white/40 text-xs truncate mt-0.5">{user.email}</p>
                  </div>
                  <a href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-white/60 hover:text-white hover:bg-white/5 text-sm transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625z" /></svg>
                    Dashboard
                  </a>
                  <a href="/inventory" className="flex items-center gap-2 px-4 py-2.5 text-white/60 hover:text-white hover:bg-white/5 text-sm transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
                    Browse cars
                  </a>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 hover:bg-red-500/5 text-sm transition-colors border-t border-white/5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <a href="/login" className="text-white/60 hover:text-white text-sm transition-colors">
              Sign in
            </a>
          )}
          <a
            href="/contact"
            className="bg-[#C9A84C] hover:bg-[#D4B86A] text-black text-sm font-semibold px-5 py-2.5 rounded-sm transition-all duration-200 tracking-wide"
          >
            Contact us
          </a>
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-white p-2"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <div className={cn("w-5 h-0.5 bg-white transition-all mb-1.5", menuOpen && "rotate-45 translate-y-2")} />
          <div className={cn("w-5 h-0.5 bg-white transition-all mb-1.5", menuOpen && "opacity-0")} />
          <div className={cn("w-5 h-0.5 bg-white transition-all", menuOpen && "-rotate-45 -translate-y-2")} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-[#0a0a0a] border-t border-white/5 px-6 py-4 flex flex-col gap-4">
          {["Inventory", "Dealerships", "Finance", "About"].map((item) => (
            item === "Finance" ? (
              <button key={item} type="button" onClick={onOpenFinance} className="text-white/70 text-sm py-1 text-left">
                {item}
              </button>
            ) : (
              <a key={item} href={item === "About" ? "#about" : `/${item.toLowerCase()}`} className="text-white/70 text-sm py-1">
                {item}
              </a>
            )
          ))}
          {user ? (
            <button onClick={handleSignOut} className="text-red-400 text-sm py-1 text-left">
              Sign out
            </button>
          ) : (
            <a href="/login" className="text-white/70 text-sm py-1">Sign in</a>
          )}
          <a href="/contact" className="bg-[#C9A84C] text-black text-sm font-semibold px-5 py-2.5 rounded-sm text-center mt-2">
            Contact us
          </a>
        </div>
      )}
    </nav>
  )
}

function HeroSection({ onOpenFinance }) {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100)
    return () => clearTimeout(t)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-[#080808]">
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1800&q=85"
          alt="Luxury car"
          className="w-full h-full object-cover opacity-30"
          style={{ objectPosition: "center 40%" }}
        />
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/40" />
      </div>

      {/* Decorative gold line */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-32 bg-gradient-to-b from-transparent via-[#C9A84C] to-transparent" />

      {/* Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12">
        <div className="max-w-2xl">
          {/* Eyebrow */}
          <div
            className={cn(
              "flex items-center gap-3 mb-8 transition-all duration-700",
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <div className="h-px w-8 bg-[#C9A84C]" />
            <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase font-medium">
              Premium Automotive
            </span>
          </div>

          {/* Headline */}
          <h1
            className={cn(
              "text-5xl md:text-7xl font-bold text-white leading-[0.95] tracking-tight mb-6 transition-all duration-700 delay-100",
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
            style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
          >
            Drive the
            <br />
            <span className="text-[#C9A84C] italic">Extraordinary</span>
          </h1>

          {/* Subheadline */}
          <p
            className={cn(
              "text-white/50 text-lg leading-relaxed mb-10 max-w-lg transition-all duration-700 delay-200",
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            Discover our curated collection of luxury and performance vehicles.
            Exceptional quality, transparent pricing, unmatched service.
          </p>

          {/* CTAs */}
          <div
            className={cn(
              "flex flex-wrap gap-4 transition-all duration-700 delay-300",
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            <a
              href="/inventory"
              className="bg-[#C9A84C] hover:bg-[#D4B86A] text-black font-semibold px-8 py-4 rounded-sm tracking-wide transition-all duration-200 text-sm"
            >
              Browse inventory
            </a>
            <button
              type="button"
              onClick={onOpenFinance}
              className="border border-white/20 hover:border-white/50 text-white/80 hover:text-white font-medium px-8 py-4 rounded-sm tracking-wide transition-all duration-200 text-sm"
            >
              Get financing
            </button>
          </div>

          {/* Stats row */}
          <div
            className={cn(
              "grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-white/10 transition-all duration-700 delay-500",
              loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                      <Counter target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="text-white/40 text-xs mt-1 tracking-wide uppercase">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
        <span className="text-xs tracking-[0.2em] uppercase">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
      </div>
    </section>
  )
}

function SearchBar() {
  const [make, setMake] = useState("All Makes")
  const [model, setModel] = useState("All Models")
  const [year, setYear] = useState("Any Year")
  const [query, setQuery] = useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    const params = new URLSearchParams({ make, model, year, q: query })
    window.location.href = `/inventory?${params}`
  }

  return (
    <section className="relative z-20 -mt-8 px-6 max-w-5xl mx-auto">
      <form
        onSubmit={handleSearch}
        className="bg-[#111111] border border-white/10 rounded-sm p-2 flex flex-wrap md:flex-nowrap gap-2 shadow-2xl"
      >
        {/* Text search */}
        <div className="flex-1 min-w-[200px] flex items-center gap-3 bg-white/5 rounded-sm px-4 py-3">
          <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search by make, model, keyword..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-transparent text-white text-sm placeholder-white/30 outline-none w-full"
          />
        </div>

        {/* Make */}
        <select
          value={make}
          onChange={(e) => setMake(e.target.value)}
          className="bg-white/5 text-white/70 text-sm px-4 py-3 rounded-sm outline-none border-0 cursor-pointer min-w-[130px]"
        >
          {MAKES.map((m) => <option key={m} value={m} className="bg-[#1a1a1a]">{m}</option>)}
        </select>

        {/* Model */}
        <select
          value={model}
          onChange={(e) => setModel(e.target.value)}
          className="bg-white/5 text-white/70 text-sm px-4 py-3 rounded-sm outline-none border-0 cursor-pointer min-w-[130px]"
        >
          {MODELS.map((m) => <option key={m} value={m} className="bg-[#1a1a1a]">{m}</option>)}
        </select>

        {/* Year */}
        <select
          value={year}
          onChange={(e) => setYear(e.target.value)}
          className="bg-white/5 text-white/70 text-sm px-4 py-3 rounded-sm outline-none border-0 cursor-pointer min-w-[110px]"
        >
          {YEARS.map((y) => <option key={y} value={y} className="bg-[#1a1a1a]">{y}</option>)}
        </select>

        {/* Search button */}
        <button
          type="submit"
          className="bg-[#C9A84C] hover:bg-[#D4B86A] text-black font-semibold px-8 py-3 rounded-sm text-sm tracking-wide transition-colors whitespace-nowrap"
        >
          Search
        </button>
      </form>
    </section>
  )
}

const BADGE_STYLES = {
  gold: "bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/20",
  silver: "bg-white/5 text-white/70 border-white/10",
  blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
}

function CarCard({ car, index, onOpen }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const [hovered, setHovered] = useState(false)

  return (
    <button
      type="button"
      onClick={() => onOpen(car)}
      className="group block w-full text-left bg-[#111111] border border-white/5 rounded-sm overflow-hidden hover:border-[#C9A84C]/30 transition-all duration-300"
      style={{ animationDelay: `${index * 80}ms` }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div className="relative overflow-hidden aspect-[16/10] bg-[#1a1a1a]">
        <img
          src={car.image}
          alt={`${car.year} ${car.make} ${car.model}`}
          onLoad={() => setImgLoaded(true)}
          className={cn(
            "w-full h-full object-cover transition-all duration-700",
            imgLoaded ? "opacity-100" : "opacity-0",
            hovered ? "scale-105" : "scale-100"
          )}
        />
        {!imgLoaded && (
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent animate-pulse" />
        )}
        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span className={cn("text-xs px-2.5 py-1 rounded-sm border font-medium tracking-wide", BADGE_STYLES[car.badgeColor])}>
            {car.badge}
          </span>
        </div>
        {/* Fuel type */}
        <div className="absolute top-3 right-3">
          <span className="text-xs px-2 py-1 bg-black/60 text-white/60 rounded-sm backdrop-blur-sm">
            {car.fuel}
          </span>
        </div>
        {/* Hover overlay */}
        <div className={cn("absolute inset-0 bg-[#C9A84C]/5 transition-opacity duration-300", hovered ? "opacity-100" : "opacity-0")} />
      </div>

      {/* Info */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-1">
          <div>
            <div className="text-white/40 text-xs tracking-widest uppercase mb-1">{car.make}</div>
            <h3 className="text-white font-semibold text-base leading-tight">
              {car.year} {car.model}
            </h3>
          </div>
          <div className="text-right">
            <div className="text-[#C9A84C] font-bold text-lg">
              ${car.price.toLocaleString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
          <span className="text-white/40 text-xs">
            {car.mileage === 0 ? "Brand new" : `${car.mileage.toLocaleString()} mi`}
          </span>
          <span className="text-white/20 text-xs">·</span>
          <span className="text-white/40 text-xs">{car.transmission}</span>
          <div className="ml-auto">
            <span className={cn(
              "text-xs font-medium transition-all duration-300",
              hovered ? "text-[#C9A84C]" : "text-transparent"
            )}>
              View details →
            </span>
          </div>
        </div>
      </div>
    </button>
  )
}

function HomeCarPreviewModal({ car, onClose }) {
  useEffect(() => {
    if (!car) return undefined

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose()
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [car, onClose])

  if (!car) return null

  const MagnifiedHomeImage = () => {
    const [lens, setLens] = useState({ active: false, x: 50, y: 50 })
    const zoom = 420

    const handleMove = (event) => {
      const rect = event.currentTarget.getBoundingClientRect()
      const x = ((event.clientX - rect.left) / rect.width) * 100
      const y = ((event.clientY - rect.top) / rect.height) * 100

      setLens({
        active: true,
        x: Math.min(100, Math.max(0, x)),
        y: Math.min(100, Math.max(0, y)),
      })
    }

    return (
      <div
        className="absolute inset-0 flex items-center justify-center bg-[#151515] cursor-none"
        onMouseMove={handleMove}
        onMouseEnter={handleMove}
        onMouseLeave={() => setLens((current) => ({ ...current, active: false }))}
      >
        <img
          src={car.image}
          alt={`${car.year} ${car.make} ${car.model}`}
          className="h-full w-full object-contain opacity-95"
        />

        <div className="pointer-events-none absolute left-5 top-5 border border-white/10 bg-black/45 backdrop-blur-md rounded-sm px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-white/45">
          Hover to inspect
        </div>

        <div
          className={cn(
            "pointer-events-none absolute hidden md:block h-24 w-24 rounded-sm border border-[#C9A84C]/65 bg-[#C9A84C]/10 shadow-[0_0_0_9999px_rgba(0,0,0,0.04)] transition-opacity duration-150",
            lens.active ? "opacity-100" : "opacity-0"
          )}
          style={{
            left: `${lens.x}%`,
            top: `${lens.y}%`,
            transform: "translate(-50%, -50%)",
          }}
        />

        <div
          className={cn(
            "pointer-events-none absolute right-5 top-5 hidden h-48 w-48 overflow-hidden rounded-sm border border-[#C9A84C]/45 bg-[#101010] bg-no-repeat shadow-2xl ring-1 ring-black/60 md:block transition-all duration-150",
            lens.active ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
          )}
          style={{
            backgroundImage: `url(${car.image})`,
            backgroundSize: `${zoom}% ${zoom}%`,
            backgroundPosition: `${lens.x}% ${lens.y}%`,
          }}
        >
          <div className="absolute inset-x-0 bottom-0 bg-black/55 backdrop-blur-sm px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-[#C9A84C]">
            Detail view
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close vehicle preview"
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-md"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="home-car-preview-title"
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-white/15 bg-[#0b0b0b]/78 backdrop-blur-xl rounded-sm shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-sm border border-white/10 bg-black/35 text-white/60 hover:text-white hover:border-[#C9A84C]/50 transition-colors"
        >
          <X className="w-4 h-4" strokeWidth={1.7} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="relative min-h-[320px] lg:min-h-[600px] bg-[#151515]">
            <MagnifiedHomeImage />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#080808] via-[#080808]/10 to-transparent" />
            <div className="absolute left-5 bottom-5 flex flex-wrap gap-2 pointer-events-none">
              <span className={cn("text-xs px-3 py-1.5 rounded-sm border font-medium tracking-wide", BADGE_STYLES[car.badgeColor])}>
                {car.badge}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-sm border border-white/10 bg-black/50 text-white/70 backdrop-blur-sm">
                <Sparkles className="w-3 h-3" strokeWidth={1.7} />
                Handpicked
              </span>
            </div>
          </div>

          <div className="p-6 md:p-8 lg:p-10">
            <p className="text-[#C9A84C] text-xs tracking-[0.32em] uppercase mb-4">{car.make}</p>
            <h2
              id="home-car-preview-title"
              className="text-4xl md:text-5xl font-bold leading-tight text-white"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {car.year} {car.model}
            </h2>
            <p className="mt-4 text-[#C9A84C] text-3xl font-bold">{formatCurrency(car.price)}</p>
            <p className="mt-5 text-white/48 leading-relaxed">{getCarDescription(car)}</p>

            <div className="grid grid-cols-2 gap-3 mt-7">
              {[
                ["Mileage", car.mileage ? `${car.mileage.toLocaleString()} mi` : "Delivery"],
                ["Fuel", titleCase(car.fuel)],
                ["Transmission", titleCase(car.transmission)],
                ["Status", car.badge],
              ].map(([label, value]) => (
                <div key={label} className="border border-white/10 bg-white/[0.035] rounded-sm p-4">
                  <p className="text-white/35 text-xs uppercase tracking-[0.22em] mb-2">{label}</p>
                  <p className="text-white font-semibold">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-start gap-3 text-white/45 text-sm leading-relaxed">
                <MapPin className="w-4 h-4 mt-0.5 text-[#C9A84C] flex-shrink-0" strokeWidth={1.5} />
                <span>
                  Available through the AutoLux network. A specialist can prepare availability,
                  financing, and viewing details before you arrive.
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-7">
                <a
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#D4B86A] text-black font-semibold px-5 py-3.5 rounded-sm text-sm transition-colors"
                >
                  <CalendarDays className="w-4 h-4" strokeWidth={1.7} />
                  Schedule viewing
                </a>
                <a
                  href="/inventory"
                  className="inline-flex items-center justify-center border border-white/15 hover:border-white/40 text-white/65 hover:text-white px-5 py-3.5 rounded-sm text-sm transition-colors"
                >
                  Browse full inventory
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function FeaturedCars() {
  const [filter, setFilter] = useState("All")
  const [selectedCar, setSelectedCar] = useState(null)
  const filters = ["All", "New", "Certified", "Electric"]

  const filtered = filter === "All"
    ? FEATURED_CARS
    : FEATURED_CARS.filter((c) =>
        filter === "New" ? c.mileage === 0 :
        filter === "Electric" ? c.fuel === "Electric" :
        c.badge === filter
      )

  return (
    <section className="py-24 px-6 bg-[#080808]">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="h-px w-8 bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase">Handpicked</span>
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold text-white"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Featured vehicles
            </h2>
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 bg-white/5 p-1 rounded-sm">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 text-sm rounded-sm transition-all duration-200 font-medium",
                  filter === f
                    ? "bg-[#C9A84C] text-black"
                    : "text-white/50 hover:text-white"
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((car, i) => (
            <CarCard key={car.id} car={car} index={i} onOpen={setSelectedCar} />
          ))}
        </div>

        {/* View all */}
        <div className="text-center mt-12">
          <a
            href="/inventory"
            className="inline-flex items-center gap-2 border border-white/10 hover:border-[#C9A84C]/40 text-white/60 hover:text-white px-8 py-4 rounded-sm text-sm tracking-wide transition-all duration-200"
          >
            View all inventory
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </a>
        </div>
      </div>
      <HomeCarPreviewModal car={selectedCar} onClose={() => setSelectedCar(null)} />
    </section>
  )
}

function WhyUs() {
  const FEATURES = [
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Certified vehicles",
      desc: "Every certified pre-owned vehicle passes our rigorous 150-point inspection.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Transparent pricing",
      desc: "No hidden fees, no surprises. The price you see is the price you pay.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      title: "Flexible financing",
      desc: "Custom finance plans with competitive rates from top lenders nationwide.",
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: "Home delivery",
      desc: "Test drive or take delivery at your home. We come to you.",
    },
  ]

  return (
    <section className="py-24 px-6 bg-[#0d0d0d] border-t border-white/5">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: text */}
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase">Why AutoLux</span>
            </div>
            <h2
              className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              A different kind of
              <br />
              <span className="text-[#C9A84C] italic">dealership</span>
            </h2>
            <p className="text-white/40 leading-relaxed mb-10">
              We believe buying a car should be exciting, not stressful. That's why
              we've reimagined the process from the ground up — combining premium
              inventory with a transparent, customer-first experience.
            </p>
            <a
              href="#about"
              className="text-[#C9A84C] text-sm tracking-wide font-medium flex items-center gap-2 hover:gap-3 transition-all duration-200"
            >
              Learn our story
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>

          {/* Right: feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="bg-[#111111] border border-white/5 rounded-sm p-6 hover:border-[#C9A84C]/20 transition-all duration-300 group"
              >
                <div className="text-[#C9A84C] mb-4 group-hover:scale-110 transition-transform duration-300 w-fit">
                  {f.icon}
                </div>
                <h3 className="text-white font-semibold text-sm mb-2">{f.title}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function AboutSection() {
  const PRINCIPLES = [
    {
      value: "01",
      title: "Curated, never crowded",
      desc: "Every vehicle is selected for condition, provenance, specification, and long-term desirability.",
    },
    {
      value: "02",
      title: "Advisory over sales pressure",
      desc: "Our consultants help compare options clearly, from ownership costs to delivery timing.",
    },
    {
      value: "03",
      title: "Details handled quietly",
      desc: "Inspection, financing, registration, protection plans, and delivery move through one coordinated process.",
    },
  ]

  return (
    <section id="about" className="relative overflow-hidden bg-[#080808] px-6 py-24 border-t border-white/5 scroll-mt-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent" />

      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-14 lg:gap-20 items-center">
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-sm bg-[#111111] border border-white/10">
              <img
                src="https://images.unsplash.com/photo-1563720223185-11003d516935?w=1100&q=85"
                alt="AutoLux showroom"
                className="h-full w-full object-cover opacity-80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/80 via-transparent to-transparent" />
            </div>

            <div className="absolute left-5 right-5 bottom-5 border border-white/10 bg-[#080808]/85 backdrop-blur-md rounded-sm p-5">
              <div className="flex items-center justify-between gap-5">
                <div>
                  <p className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase mb-2">Since 2009</p>
                  <p className="text-white text-sm leading-relaxed">
                    Built for buyers who value precision, discretion, and exceptional machines.
                  </p>
                </div>
                <div className="h-16 w-px bg-white/10 flex-shrink-0" />
                <div className="text-right">
                  <p className="text-3xl font-bold text-white tracking-tight">18</p>
                  <p className="text-white/35 text-xs uppercase tracking-widest mt-1">Locations</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="h-px w-8 bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase">About AutoLux</span>
            </div>

            <h2
              className="text-4xl md:text-5xl font-bold text-white leading-tight mb-6"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Luxury buying,
              <br />
              <span className="text-[#C9A84C] italic">refined end to end</span>
            </h2>

            <p className="text-white/45 leading-relaxed mb-8 max-w-2xl">
              AutoLux was created around a simple standard: a premium vehicle deserves a premium process.
              We combine carefully sourced inventory with expert guidance, transparent documentation,
              and delivery that feels composed from first conversation to final handoff.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-10">
              <div className="border-l border-[#C9A84C]/40 pl-4">
                <p className="text-2xl font-bold text-white">150</p>
                <p className="text-white/35 text-xs uppercase tracking-widest mt-1">Point inspection</p>
              </div>
              <div className="border-l border-[#C9A84C]/40 pl-4">
                <p className="text-2xl font-bold text-white">24h</p>
                <p className="text-white/35 text-xs uppercase tracking-widest mt-1">Purchase support</p>
              </div>
            </div>

            <div className="space-y-4">
              {PRINCIPLES.map((item) => (
                <div
                  key={item.title}
                  className="group grid grid-cols-[3rem_1fr] gap-4 border-t border-white/10 pt-4"
                >
                  <span className="text-[#C9A84C]/70 text-xs tracking-[0.25em] font-medium pt-1">
                    {item.value}
                  </span>
                  <div>
                    <h3 className="text-white font-semibold text-sm mb-1 group-hover:text-[#C9A84C] transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-white/35 text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function FinanceModal({ open, onClose }) {
  const [vehiclePrice, setVehiclePrice] = useState(98000)
  const [downPayment, setDownPayment] = useState(15000)
  const [tradeValue, setTradeValue] = useState(18000)
  const [term, setTerm] = useState(60)
  const [rate, setRate] = useState(6.4)
  const [mileage, setMileage] = useState(42000)
  const [condition, setCondition] = useState("excellent")

  useEffect(() => {
    if (!open) return undefined

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose()
    }

    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", onKeyDown)

    return () => {
      document.body.style.overflow = ""
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [open, onClose])

  if (!open) return null

  const principal = Math.max(Number(vehiclePrice) - Number(downPayment) - Number(tradeValue), 0)
  const monthlyRate = Number(rate) / 100 / 12
  const monthlyPayment = principal === 0
    ? 0
    : monthlyRate === 0
      ? principal / Number(term)
      : principal * (monthlyRate * (1 + monthlyRate) ** Number(term)) / ((1 + monthlyRate) ** Number(term) - 1)
  const conditionMultiplier = {
    excellent: 1,
    good: 0.92,
    fair: 0.82,
  }[condition]
  const mileageAdjustment = Math.max(0.66, 1 - Number(mileage) / 260000)
  const instantOffer = Math.round(Number(tradeValue) * conditionMultiplier * mileageAdjustment)
  const totalInterest = Math.max(monthlyPayment * Number(term) - principal, 0)

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6">
      <button
        type="button"
        aria-label="Close finance calculator"
        onClick={onClose}
        className="absolute inset-0 bg-black/55 backdrop-blur-md"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="finance-title"
        className="relative w-full max-w-5xl max-h-[90vh] overflow-y-auto border border-white/15 bg-[#0b0b0b]/78 backdrop-blur-xl rounded-sm shadow-2xl"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 z-20 inline-flex h-10 w-10 items-center justify-center rounded-sm border border-white/10 bg-black/35 text-white/60 hover:text-white hover:border-[#C9A84C]/50 transition-colors"
        >
          <X className="w-4 h-4" strokeWidth={1.7} />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative min-h-[340px] bg-[#111111] p-8 md:p-10 flex flex-col justify-between overflow-hidden">
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=1100&q=85"
                alt="Premium finance desk"
                className="h-full w-full object-cover opacity-20"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/80 to-[#080808]/45" />
            </div>

            <div className="relative">
              <div className="inline-flex items-center gap-2 text-[#C9A84C] text-xs tracking-[0.3em] uppercase mb-5">
                <Calculator className="w-4 h-4" strokeWidth={1.6} />
                Finance studio
              </div>
              <h2
                id="finance-title"
                className="text-4xl md:text-5xl font-bold leading-tight text-white"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Estimate your
                <br />
                <span className="text-[#C9A84C] italic">monthly path</span>
              </h2>
              <p className="mt-5 text-white/45 leading-relaxed">
                Adjust the numbers and watch the offer update instantly. This is an estimate,
                built for planning before a specialist prepares lender-ready terms.
              </p>
            </div>

            <div className="relative grid grid-cols-2 gap-3 mt-8">
              <div className="border border-white/10 bg-black/30 rounded-sm p-4">
                <p className="text-white/35 text-xs uppercase tracking-[0.22em] mb-2">Payment</p>
                <p className="text-[#C9A84C] text-3xl font-bold">{formatCurrency(monthlyPayment)}</p>
                <p className="text-white/30 text-xs mt-1">per month</p>
              </div>
              <div className="border border-white/10 bg-black/30 rounded-sm p-4">
                <p className="text-white/35 text-xs uppercase tracking-[0.22em] mb-2">Trade offer</p>
                <p className="text-white text-3xl font-bold">{formatCurrency(instantOffer)}</p>
                <p className="text-white/30 text-xs mt-1">instant estimate</p>
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 lg:p-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ["Vehicle price", vehiclePrice, setVehiclePrice, 1000],
                ["Down payment", downPayment, setDownPayment, 500],
                ["Trade-in value", tradeValue, setTradeValue, 500],
                ["Trade mileage", mileage, setMileage, 1000],
              ].map(([label, value, setter, step]) => (
                <label key={label} className="block">
                  <span className="block text-white/35 text-xs uppercase tracking-[0.2em] mb-2">{label}</span>
                  <input
                    type="number"
                    min="0"
                    step={step}
                    value={value}
                    onChange={(event) => setter(Number(event.target.value))}
                    className="w-full bg-white/[0.04] border border-white/10 rounded-sm px-3 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/70 transition-colors"
                  />
                </label>
              ))}

              <label className="block">
                <span className="block text-white/35 text-xs uppercase tracking-[0.2em] mb-2">Term</span>
                <select
                  value={term}
                  onChange={(event) => setTerm(Number(event.target.value))}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-sm px-3 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/70 transition-colors"
                >
                  {[36, 48, 60, 72, 84].map((item) => (
                    <option key={item} value={item} className="bg-[#111111]">{item} months</option>
                  ))}
                </select>
              </label>

              <label className="block">
                <span className="block text-white/35 text-xs uppercase tracking-[0.2em] mb-2">APR</span>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={rate}
                  onChange={(event) => setRate(Number(event.target.value))}
                  className="w-full bg-white/[0.04] border border-white/10 rounded-sm px-3 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/70 transition-colors"
                />
              </label>

              <label className="block sm:col-span-2">
                <span className="block text-white/35 text-xs uppercase tracking-[0.2em] mb-2">Trade condition</span>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["excellent", "Excellent"],
                    ["good", "Good"],
                    ["fair", "Fair"],
                  ].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setCondition(value)}
                      className={cn(
                        "px-3 py-3 rounded-sm border text-sm transition-colors",
                        condition === value
                          ? "bg-[#C9A84C] border-[#C9A84C] text-black font-semibold"
                          : "border-white/10 bg-white/[0.04] text-white/55 hover:text-white"
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-7 pt-6 border-t border-white/10">
              <div>
                <p className="text-white/35 text-xs uppercase tracking-[0.22em] mb-2">Amount financed</p>
                <p className="text-white font-semibold">{formatCurrency(principal)}</p>
              </div>
              <div>
                <p className="text-white/35 text-xs uppercase tracking-[0.22em] mb-2">Interest est.</p>
                <p className="text-white font-semibold">{formatCurrency(totalInterest)}</p>
              </div>
              <div>
                <p className="text-white/35 text-xs uppercase tracking-[0.22em] mb-2">Equity credit</p>
                <p className="text-white font-semibold">{formatCurrency(Number(downPayment) + instantOffer)}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-8">
              <a
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#D4B86A] text-black font-semibold px-5 py-3.5 rounded-sm text-sm transition-colors"
              >
                Request exact terms
              </a>
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center border border-white/15 hover:border-white/40 text-white/65 hover:text-white px-5 py-3.5 rounded-sm text-sm transition-colors"
              >
                Continue browsing
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

function CTABanner({ onOpenFinance }) {
  return (
    <section className="relative py-24 px-6 overflow-hidden bg-[#080808]">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1600&q=80"
          alt=""
          className="w-full h-full object-cover opacity-15"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] to-[#080808]/80" />
      </div>

      {/* Gold geometric accent */}
      <div className="absolute right-24 top-1/2 -translate-y-1/2 w-48 h-48 border border-[#C9A84C]/10 rotate-12 rounded-sm hidden lg:block" />
      <div className="absolute right-32 top-1/2 -translate-y-1/2 w-32 h-32 border border-[#C9A84C]/10 rotate-12 rounded-sm hidden lg:block" />

      <div className="relative z-10 max-w-3xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="h-px w-8 bg-[#C9A84C]" />
          <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase">Sell or trade</span>
          <div className="h-px w-8 bg-[#C9A84C]" />
        </div>
        <h2
          className="text-4xl md:text-5xl font-bold text-white mb-5"
          style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        >
          Ready to sell your vehicle?
        </h2>
        <p className="text-white/40 mb-10 leading-relaxed">
          Get an instant offer in minutes. We buy any make, any model — at fair market value.
          No obligation, no pressure.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <button
            type="button"
            onClick={onOpenFinance}
            className="bg-[#C9A84C] hover:bg-[#D4B86A] text-black font-semibold px-8 py-4 rounded-sm text-sm tracking-wide transition-all duration-200"
          >
            Get instant offer
          </button>
          <button
            type="button"
            onClick={onOpenFinance}
            className="border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-medium px-8 py-4 rounded-sm text-sm tracking-wide transition-all duration-200"
          >
            Trade-in value
          </button>
        </div>
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="bg-[#060606] border-t border-white/5 py-12 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-[#C9A84C] rounded-sm flex items-center justify-center">
                <span className="text-black font-bold text-sm">A</span>
              </div>
              <span className="text-white font-semibold tracking-widest text-sm uppercase">AutoLux</span>
            </div>
            <p className="text-white/30 text-sm leading-relaxed">
              Premium automotive dealership. 18 locations nationwide.
            </p>
          </div>
          {[
            { title: "Inventory", links: ["All vehicles", "New cars", "Certified pre-owned", "Electric"] },
            { title: "Services", links: ["Financing", "Trade-in", "Home delivery", "Concierge"] },
            { title: "Company", links: ["About us", "Careers", "Contact", "Privacy policy"] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="text-white text-xs font-semibold tracking-widest uppercase mb-4">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-white/30 text-sm hover:text-white/70 transition-colors">{l}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs">© 2024 AutoLux. All rights reserved.</p>
          <p className="text-white/20 text-xs">Built with Django + React + Firebase</p>
        </div>
      </div>
    </footer>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function HomePage() {
  const [financeOpen, setFinanceOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#080808]">
      {/* Playfair Display font */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&display=swap"
      />
      <Navbar onOpenFinance={() => setFinanceOpen(true)} />
      <HeroSection onOpenFinance={() => setFinanceOpen(true)} />
      <SearchBar />
      <FeaturedCars />
      <WhyUs />
      <AboutSection />
      <CTABanner onOpenFinance={() => setFinanceOpen(true)} />
      <Footer />
      <FinanceModal open={financeOpen} onClose={() => setFinanceOpen(false)} />
    </div>
  )
}







// // CODE from Claude
// import { useState, useEffect, useRef } from "react"
// import { onAuthStateChanged, signOut } from "firebase/auth"
// import { auth } from "../firebase/config"

// // ─── Utility ────────────────────────────────────────────────────────────────
// const cn = (...classes) => classes.filter(Boolean).join(" ")

// // ─── Mock data (replace with API calls) ─────────────────────────────────────
// const FEATURED_CARS = [
//   {
//     id: 1,
//     make: "BMW",
//     model: "M5 Competition",
//     year: 2024,
//     price: 115000,
//     mileage: 0,
//     fuel: "Gasoline",
//     transmission: "Automatic",
//     image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800&q=80",
//     badge: "New Arrival",
//     badgeColor: "gold",
//   },
//   {
//     id: 2,
//     make: "Mercedes-Benz",
//     model: "GLE 63 AMG",
//     year: 2024,
//     price: 132000,
//     mileage: 1200,
//     fuel: "Hybrid",
//     transmission: "Automatic",
//     image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&q=80",
//     badge: "Featured",
//     badgeColor: "silver",
//   },
//   {
//     id: 3,
//     make: "Porsche",
//     model: "Cayenne Turbo",
//     year: 2023,
//     price: 147500,
//     mileage: 8400,
//     fuel: "Gasoline",
//     transmission: "Automatic",
//     image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&q=80",
//     badge: "Certified",
//     badgeColor: "blue",
//   },
//   {
//     id: 4,
//     make: "Audi",
//     model: "RS7 Sportback",
//     year: 2024,
//     price: 126900,
//     mileage: 0,
//     fuel: "Gasoline",
//     transmission: "Automatic",
//     image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=800&q=80",
//     badge: "New Arrival",
//     badgeColor: "gold",
//   },
//   {
//     id: 5,
//     make: "Lexus",
//     model: "LC 500",
//     year: 2023,
//     price: 98500,
//     mileage: 5200,
//     fuel: "Gasoline",
//     transmission: "Automatic",
//     image: "https://images.unsplash.com/photo-1621993202323-01f0fd7d0f86?w=800&q=80",
//     badge: "Certified",
//     badgeColor: "blue",
//   },
//   {
//     id: 6,
//     make: "Tesla",
//     model: "Model S Plaid",
//     year: 2024,
//     price: 108990,
//     mileage: 0,
//     fuel: "Electric",
//     transmission: "Single-speed",
//     image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=800&q=80",
//     badge: "Electric",
//     badgeColor: "green",
//   },
// ]

// const STATS = [
//   { value: "2,400+", label: "Vehicles in stock" },
//   { value: "18", label: "Dealership locations" },
//   { value: "98%", label: "Customer satisfaction" },
//   { value: "15yr", label: "In business" },
// ]

// const MAKES = ["All Makes", "BMW", "Mercedes-Benz", "Porsche", "Audi", "Lexus", "Tesla", "Toyota", "Honda"]
// const MODELS = ["All Models", "Sedan", "SUV", "Coupe", "Convertible", "Truck", "Van"]
// const YEARS = ["Any Year", "2024", "2023", "2022", "2021", "2020", "2019 & older"]

// // ─── Sub-components ──────────────────────────────────────────────────────────

// function Navbar() {
//   const [scrolled, setScrolled] = useState(false)
//   const [menuOpen, setMenuOpen] = useState(false)
//   const [user, setUser] = useState(null)
//   const [dropdownOpen, setDropdownOpen] = useState(false)

//   useEffect(() => {
//     const onScroll = () => setScrolled(window.scrollY > 40)
//     window.addEventListener("scroll", onScroll)
//     return () => window.removeEventListener("scroll", onScroll)
//   }, [])

//   useEffect(() => {
//     const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u))
//     return unsubscribe
//   }, [])

//   const handleSignOut = async () => {
//     await signOut(auth)
//     setDropdownOpen(false)
//   }

//   const getInitials = (u) => {
//     if (u?.displayName) {
//       return u.displayName.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
//     }
//     return u?.email?.[0]?.toUpperCase() || "U"
//   }

//   return (
//     <nav
//       className={cn(
//         "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
//         scrolled ? "bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 py-3" : "py-6"
//       )}
//     >
//       <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
//         {/* Logo */}
//         <a href="/" className="flex items-center gap-3">
//           <div className="w-8 h-8 bg-[#C9A84C] rounded-sm flex items-center justify-center">
//             <span className="text-black font-bold text-sm tracking-tighter">A</span>
//           </div>
//           <span className="text-white font-semibold tracking-widest text-sm uppercase">AutoLux</span>
//         </a>

//         {/* Desktop Nav */}
//         <div className="hidden md:flex items-center gap-8">
//           {["Inventory", "Dealerships", "Finance", "About"].map((item) => (
//             <a
//               key={item}
//               href={`/${item.toLowerCase()}`}
//               className="text-white/60 hover:text-white text-sm tracking-wide transition-colors duration-200"
//             >
//               {item}
//             </a>
//           ))}
//         </div>

//         {/* CTA — auth aware */}
//         <div className="hidden md:flex items-center gap-4">
//           {user ? (
//             <div className="relative">
//               <button
//                 onClick={() => setDropdownOpen(!dropdownOpen)}
//                 className="flex items-center gap-2.5 group"
//               >
//                 <div className="w-8 h-8 rounded-sm bg-[#C9A84C] flex items-center justify-center text-black font-bold text-xs">
//                   {getInitials(user)}
//                 </div>
//                 <span className="text-white/70 text-sm group-hover:text-white transition-colors max-w-[120px] truncate">
//                   {user.displayName || user.email}
//                 </span>
//                 <svg className={cn("w-3 h-3 text-white/40 transition-transform", dropdownOpen && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
//                   <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
//                 </svg>
//               </button>
//               {dropdownOpen && (
//                 <div className="absolute right-0 top-12 w-48 bg-[#111] border border-white/10 rounded-sm shadow-2xl overflow-hidden z-50">
//                   <div className="px-4 py-3 border-b border-white/5">
//                     <p className="text-white text-xs font-medium truncate">{user.displayName || "User"}</p>
//                     <p className="text-white/40 text-xs truncate mt-0.5">{user.email}</p>
//                   </div>
//                   <a href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 text-white/60 hover:text-white hover:bg-white/5 text-sm transition-colors">
//                     <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75z" /><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625z" /></svg>
//                     Dashboard
//                   </a>
//                   <a href="/inventory" className="flex items-center gap-2 px-4 py-2.5 text-white/60 hover:text-white hover:bg-white/5 text-sm transition-colors">
//                     <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>
//                     Browse cars
//                   </a>
//                   <button
//                     onClick={handleSignOut}
//                     className="w-full flex items-center gap-2 px-4 py-2.5 text-red-400 hover:bg-red-500/5 text-sm transition-colors border-t border-white/5"
//                   >
//                     <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
//                     Sign out
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <a href="/login" className="text-white/60 hover:text-white text-sm transition-colors">
//               Sign in
//             </a>
//           )}
//           <a
//             href="/contact"
//             className="bg-[#C9A84C] hover:bg-[#D4B86A] text-black text-sm font-semibold px-5 py-2.5 rounded-sm transition-all duration-200 tracking-wide"
//           >
//             Contact us
//           </a>
//         </div>

//         {/* Mobile menu button */}
//         <button
//           className="md:hidden text-white p-2"
//           onClick={() => setMenuOpen(!menuOpen)}
//           aria-label="Toggle menu"
//         >
//           <div className={cn("w-5 h-0.5 bg-white transition-all mb-1.5", menuOpen && "rotate-45 translate-y-2")} />
//           <div className={cn("w-5 h-0.5 bg-white transition-all mb-1.5", menuOpen && "opacity-0")} />
//           <div className={cn("w-5 h-0.5 bg-white transition-all", menuOpen && "-rotate-45 -translate-y-2")} />
//         </button>
//       </div>

//       {/* Mobile Menu */}
//       {menuOpen && (
//         <div className="md:hidden bg-[#0a0a0a] border-t border-white/5 px-6 py-4 flex flex-col gap-4">
//           {["Inventory", "Dealerships", "Finance", "About"].map((item) => (
//             <a key={item} href={`/${item.toLowerCase()}`} className="text-white/70 text-sm py-1">
//               {item}
//             </a>
//           ))}
//           {user ? (
//             <button onClick={handleSignOut} className="text-red-400 text-sm py-1 text-left">
//               Sign out
//             </button>
//           ) : (
//             <a href="/login" className="text-white/70 text-sm py-1">Sign in</a>
//           )}
//           <a href="/contact" className="bg-[#C9A84C] text-black text-sm font-semibold px-5 py-2.5 rounded-sm text-center mt-2">
//             Contact us
//           </a>
//         </div>
//       )}
//     </nav>
//   )
// }

// function HeroSection() {
//   const [loaded, setLoaded] = useState(false)

//   useEffect(() => {
//     const t = setTimeout(() => setLoaded(true), 100)
//     return () => clearTimeout(t)
//   }, [])

//   return (
//     <section className="relative min-h-screen flex items-center overflow-hidden bg-[#080808]">
//       {/* Background image */}
//       <div className="absolute inset-0">
//         <img
//           src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1800&q=85"
//           alt="Luxury car"
//           className="w-full h-full object-cover opacity-30"
//           style={{ objectPosition: "center 40%" }}
//         />
//         {/* Gradient overlays */}
//         <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/80 to-transparent" />
//         <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/40" />
//       </div>

//       {/* Decorative gold line */}
//       <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-32 bg-gradient-to-b from-transparent via-[#C9A84C] to-transparent" />

//       {/* Content */}
//       <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-12">
//         <div className="max-w-2xl">
//           {/* Eyebrow */}
//           <div
//             className={cn(
//               "flex items-center gap-3 mb-8 transition-all duration-700",
//               loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
//             )}
//           >
//             <div className="h-px w-8 bg-[#C9A84C]" />
//             <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase font-medium">
//               Premium Automotive
//             </span>
//           </div>

//           {/* Headline */}
//           <h1
//             className={cn(
//               "text-5xl md:text-7xl font-bold text-white leading-[0.95] tracking-tight mb-6 transition-all duration-700 delay-100",
//               loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
//             )}
//             style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
//           >
//             Drive the
//             <br />
//             <span className="text-[#C9A84C] italic">Extraordinary</span>
//           </h1>

//           {/* Subheadline */}
//           <p
//             className={cn(
//               "text-white/50 text-lg leading-relaxed mb-10 max-w-lg transition-all duration-700 delay-200",
//               loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
//             )}
//           >
//             Discover our curated collection of luxury and performance vehicles.
//             Exceptional quality, transparent pricing, unmatched service.
//           </p>

//           {/* CTAs */}
//           <div
//             className={cn(
//               "flex flex-wrap gap-4 transition-all duration-700 delay-300",
//               loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
//             )}
//           >
//             <a
//               href="/inventory"
//               className="bg-[#C9A84C] hover:bg-[#D4B86A] text-black font-semibold px-8 py-4 rounded-sm tracking-wide transition-all duration-200 text-sm"
//             >
//               Browse inventory
//             </a>
//             <a
//               href="/finance"
//               className="border border-white/20 hover:border-white/50 text-white/80 hover:text-white font-medium px-8 py-4 rounded-sm tracking-wide transition-all duration-200 text-sm"
//             >
//               Get financing
//             </a>
//           </div>

//           {/* Stats row */}
//           <div
//             className={cn(
//               "grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-12 border-t border-white/10 transition-all duration-700 delay-500",
//               loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
//             )}
//           >
//             {STATS.map((stat) => (
//               <div key={stat.label}>
//                 <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">{stat.value}</div>
//                 <div className="text-white/40 text-xs mt-1 tracking-wide uppercase">{stat.label}</div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       {/* Scroll indicator */}
//       <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30">
//         <span className="text-xs tracking-[0.2em] uppercase">Scroll</span>
//         <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent animate-pulse" />
//       </div>
//     </section>
//   )
// }

// function SearchBar() {
//   const [make, setMake] = useState("All Makes")
//   const [model, setModel] = useState("All Models")
//   const [year, setYear] = useState("Any Year")
//   const [query, setQuery] = useState("")

//   const handleSearch = (e) => {
//     e.preventDefault()
//     const params = new URLSearchParams({ make, model, year, q: query })
//     window.location.href = `/inventory?${params}`
//   }

//   return (
//     <section className="relative z-20 -mt-8 px-6 max-w-5xl mx-auto">
//       <form
//         onSubmit={handleSearch}
//         className="bg-[#111111] border border-white/10 rounded-sm p-2 flex flex-wrap md:flex-nowrap gap-2 shadow-2xl"
//       >
//         {/* Text search */}
//         <div className="flex-1 min-w-[200px] flex items-center gap-3 bg-white/5 rounded-sm px-4 py-3">
//           <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//           </svg>
//           <input
//             type="text"
//             placeholder="Search by make, model, keyword..."
//             value={query}
//             onChange={(e) => setQuery(e.target.value)}
//             className="bg-transparent text-white text-sm placeholder-white/30 outline-none w-full"
//           />
//         </div>

//         {/* Make */}
//         <select
//           value={make}
//           onChange={(e) => setMake(e.target.value)}
//           className="bg-white/5 text-white/70 text-sm px-4 py-3 rounded-sm outline-none border-0 cursor-pointer min-w-[130px]"
//         >
//           {MAKES.map((m) => <option key={m} value={m} className="bg-[#1a1a1a]">{m}</option>)}
//         </select>

//         {/* Model */}
//         <select
//           value={model}
//           onChange={(e) => setModel(e.target.value)}
//           className="bg-white/5 text-white/70 text-sm px-4 py-3 rounded-sm outline-none border-0 cursor-pointer min-w-[130px]"
//         >
//           {MODELS.map((m) => <option key={m} value={m} className="bg-[#1a1a1a]">{m}</option>)}
//         </select>

//         {/* Year */}
//         <select
//           value={year}
//           onChange={(e) => setYear(e.target.value)}
//           className="bg-white/5 text-white/70 text-sm px-4 py-3 rounded-sm outline-none border-0 cursor-pointer min-w-[110px]"
//         >
//           {YEARS.map((y) => <option key={y} value={y} className="bg-[#1a1a1a]">{y}</option>)}
//         </select>

//         {/* Search button */}
//         <button
//           type="submit"
//           className="bg-[#C9A84C] hover:bg-[#D4B86A] text-black font-semibold px-8 py-3 rounded-sm text-sm tracking-wide transition-colors whitespace-nowrap"
//         >
//           Search
//         </button>
//       </form>
//     </section>
//   )
// }

// const BADGE_STYLES = {
//   gold: "bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/20",
//   silver: "bg-white/5 text-white/70 border-white/10",
//   blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
//   green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
// }

// function CarCard({ car, index }) {
//   const [imgLoaded, setImgLoaded] = useState(false)
//   const [hovered, setHovered] = useState(false)

//   return (
//     <a
//       href={`/cars/${car.id}`}
//       className="group block bg-[#111111] border border-white/5 rounded-sm overflow-hidden hover:border-[#C9A84C]/30 transition-all duration-300"
//       style={{ animationDelay: `${index * 80}ms` }}
//       onMouseEnter={() => setHovered(true)}
//       onMouseLeave={() => setHovered(false)}
//     >
//       {/* Image */}
//       <div className="relative overflow-hidden aspect-[16/10] bg-[#1a1a1a]">
//         <img
//           src={car.image}
//           alt={`${car.year} ${car.make} ${car.model}`}
//           onLoad={() => setImgLoaded(true)}
//           className={cn(
//             "w-full h-full object-cover transition-all duration-700",
//             imgLoaded ? "opacity-100" : "opacity-0",
//             hovered ? "scale-105" : "scale-100"
//           )}
//         />
//         {!imgLoaded && (
//           <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent animate-pulse" />
//         )}
//         {/* Badge */}
//         <div className="absolute top-3 left-3">
//           <span className={cn("text-xs px-2.5 py-1 rounded-sm border font-medium tracking-wide", BADGE_STYLES[car.badgeColor])}>
//             {car.badge}
//           </span>
//         </div>
//         {/* Fuel type */}
//         <div className="absolute top-3 right-3">
//           <span className="text-xs px-2 py-1 bg-black/60 text-white/60 rounded-sm backdrop-blur-sm">
//             {car.fuel}
//           </span>
//         </div>
//         {/* Hover overlay */}
//         <div className={cn("absolute inset-0 bg-[#C9A84C]/5 transition-opacity duration-300", hovered ? "opacity-100" : "opacity-0")} />
//       </div>

//       {/* Info */}
//       <div className="p-5">
//         <div className="flex items-start justify-between mb-1">
//           <div>
//             <div className="text-white/40 text-xs tracking-widest uppercase mb-1">{car.make}</div>
//             <h3 className="text-white font-semibold text-base leading-tight">
//               {car.year} {car.model}
//             </h3>
//           </div>
//           <div className="text-right">
//             <div className="text-[#C9A84C] font-bold text-lg">
//               ${car.price.toLocaleString()}
//             </div>
//           </div>
//         </div>

//         <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/5">
//           <span className="text-white/40 text-xs">
//             {car.mileage === 0 ? "Brand new" : `${car.mileage.toLocaleString()} mi`}
//           </span>
//           <span className="text-white/20 text-xs">·</span>
//           <span className="text-white/40 text-xs">{car.transmission}</span>
//           <div className="ml-auto">
//             <span className={cn(
//               "text-xs font-medium transition-all duration-300",
//               hovered ? "text-[#C9A84C]" : "text-transparent"
//             )}>
//               View details →
//             </span>
//           </div>
//         </div>
//       </div>
//     </a>
//   )
// }

// function FeaturedCars() {
//   const [filter, setFilter] = useState("All")
//   const filters = ["All", "New", "Certified", "Electric"]

//   const filtered = filter === "All"
//     ? FEATURED_CARS
//     : FEATURED_CARS.filter((c) =>
//         filter === "New" ? c.mileage === 0 :
//         filter === "Electric" ? c.fuel === "Electric" :
//         c.badge === filter
//       )

//   return (
//     <section className="py-24 px-6 bg-[#080808]">
//       <div className="max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
//           <div>
//             <div className="flex items-center gap-3 mb-4">
//               <div className="h-px w-8 bg-[#C9A84C]" />
//               <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase">Handpicked</span>
//             </div>
//             <h2
//               className="text-4xl md:text-5xl font-bold text-white"
//               style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
//             >
//               Featured vehicles
//             </h2>
//           </div>

//           {/* Filter tabs */}
//           <div className="flex gap-1 bg-white/5 p-1 rounded-sm">
//             {filters.map((f) => (
//               <button
//                 key={f}
//                 onClick={() => setFilter(f)}
//                 className={cn(
//                   "px-4 py-2 text-sm rounded-sm transition-all duration-200 font-medium",
//                   filter === f
//                     ? "bg-[#C9A84C] text-black"
//                     : "text-white/50 hover:text-white"
//                 )}
//               >
//                 {f}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
//           {filtered.map((car, i) => (
//             <CarCard key={car.id} car={car} index={i} />
//           ))}
//         </div>

//         {/* View all */}
//         <div className="text-center mt-12">
//           <a
//             href="/inventory"
//             className="inline-flex items-center gap-2 border border-white/10 hover:border-[#C9A84C]/40 text-white/60 hover:text-white px-8 py-4 rounded-sm text-sm tracking-wide transition-all duration-200"
//           >
//             View all inventory
//             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//             </svg>
//           </a>
//         </div>
//       </div>
//     </section>
//   )
// }

// function WhyUs() {
//   const FEATURES = [
//     {
//       icon: (
//         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
//         </svg>
//       ),
//       title: "Certified vehicles",
//       desc: "Every certified pre-owned vehicle passes our rigorous 150-point inspection.",
//     },
//     {
//       icon: (
//         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//         </svg>
//       ),
//       title: "Transparent pricing",
//       desc: "No hidden fees, no surprises. The price you see is the price you pay.",
//     },
//     {
//       icon: (
//         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
//         </svg>
//       ),
//       title: "Flexible financing",
//       desc: "Custom finance plans with competitive rates from top lenders nationwide.",
//     },
//     {
//       icon: (
//         <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
//         </svg>
//       ),
//       title: "Home delivery",
//       desc: "Test drive or take delivery at your home. We come to you.",
//     },
//   ]

//   return (
//     <section className="py-24 px-6 bg-[#0d0d0d] border-t border-white/5">
//       <div className="max-w-7xl mx-auto">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
//           {/* Left: text */}
//           <div>
//             <div className="flex items-center gap-3 mb-6">
//               <div className="h-px w-8 bg-[#C9A84C]" />
//               <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase">Why AutoLux</span>
//             </div>
//             <h2
//               className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight"
//               style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
//             >
//               A different kind of
//               <br />
//               <span className="text-[#C9A84C] italic">dealership</span>
//             </h2>
//             <p className="text-white/40 leading-relaxed mb-10">
//               We believe buying a car should be exciting, not stressful. That's why
//               we've reimagined the process from the ground up — combining premium
//               inventory with a transparent, customer-first experience.
//             </p>
//             <a
//               href="/about"
//               className="text-[#C9A84C] text-sm tracking-wide font-medium flex items-center gap-2 hover:gap-3 transition-all duration-200"
//             >
//               Learn our story
//               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//               </svg>
//             </a>
//           </div>

//           {/* Right: feature cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
//             {FEATURES.map((f) => (
//               <div
//                 key={f.title}
//                 className="bg-[#111111] border border-white/5 rounded-sm p-6 hover:border-[#C9A84C]/20 transition-all duration-300 group"
//               >
//                 <div className="text-[#C9A84C] mb-4 group-hover:scale-110 transition-transform duration-300 w-fit">
//                   {f.icon}
//                 </div>
//                 <h3 className="text-white font-semibold text-sm mb-2">{f.title}</h3>
//                 <p className="text-white/40 text-sm leading-relaxed">{f.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     </section>
//   )
// }

// function CTABanner() {
//   return (
//     <section className="relative py-24 px-6 overflow-hidden bg-[#080808]">
//       {/* Background */}
//       <div className="absolute inset-0">
//         <img
//           src="https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=1600&q=80"
//           alt=""
//           className="w-full h-full object-cover opacity-15"
//         />
//         <div className="absolute inset-0 bg-gradient-to-r from-[#080808] to-[#080808]/80" />
//       </div>

//       {/* Gold geometric accent */}
//       <div className="absolute right-24 top-1/2 -translate-y-1/2 w-48 h-48 border border-[#C9A84C]/10 rotate-12 rounded-sm hidden lg:block" />
//       <div className="absolute right-32 top-1/2 -translate-y-1/2 w-32 h-32 border border-[#C9A84C]/10 rotate-12 rounded-sm hidden lg:block" />

//       <div className="relative z-10 max-w-3xl mx-auto text-center">
//         <div className="flex items-center justify-center gap-3 mb-6">
//           <div className="h-px w-8 bg-[#C9A84C]" />
//           <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase">Sell or trade</span>
//           <div className="h-px w-8 bg-[#C9A84C]" />
//         </div>
//         <h2
//           className="text-4xl md:text-5xl font-bold text-white mb-5"
//           style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
//         >
//           Ready to sell your vehicle?
//         </h2>
//         <p className="text-white/40 mb-10 leading-relaxed">
//           Get an instant offer in minutes. We buy any make, any model — at fair market value.
//           No obligation, no pressure.
//         </p>
//         <div className="flex flex-wrap gap-4 justify-center">
//           <a
//             href="/sell"
//             className="bg-[#C9A84C] hover:bg-[#D4B86A] text-black font-semibold px-8 py-4 rounded-sm text-sm tracking-wide transition-all duration-200"
//           >
//             Get instant offer
//           </a>
//           <a
//             href="/trade-in"
//             className="border border-white/20 hover:border-white/40 text-white/70 hover:text-white font-medium px-8 py-4 rounded-sm text-sm tracking-wide transition-all duration-200"
//           >
//             Trade-in value
//           </a>
//         </div>
//       </div>
//     </section>
//   )
// }

// function Footer() {
//   return (
//     <footer className="bg-[#060606] border-t border-white/5 py-12 px-6">
//       <div className="max-w-7xl mx-auto">
//         <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
//           <div className="col-span-2 md:col-span-1">
//             <div className="flex items-center gap-3 mb-4">
//               <div className="w-8 h-8 bg-[#C9A84C] rounded-sm flex items-center justify-center">
//                 <span className="text-black font-bold text-sm">A</span>
//               </div>
//               <span className="text-white font-semibold tracking-widest text-sm uppercase">AutoLux</span>
//             </div>
//             <p className="text-white/30 text-sm leading-relaxed">
//               Premium automotive dealership. 18 locations nationwide.
//             </p>
//           </div>
//           {[
//             { title: "Inventory", links: ["All vehicles", "New cars", "Certified pre-owned", "Electric"] },
//             { title: "Services", links: ["Financing", "Trade-in", "Home delivery", "Concierge"] },
//             { title: "Company", links: ["About us", "Careers", "Contact", "Privacy policy"] },
//           ].map((col) => (
//             <div key={col.title}>
//               <h4 className="text-white text-xs font-semibold tracking-widest uppercase mb-4">{col.title}</h4>
//               <ul className="space-y-2">
//                 {col.links.map((l) => (
//                   <li key={l}>
//                     <a href="#" className="text-white/30 text-sm hover:text-white/70 transition-colors">{l}</a>
//                   </li>
//                 ))}
//               </ul>
//             </div>
//           ))}
//         </div>
//         <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
//           <p className="text-white/20 text-xs">© 2024 AutoLux. All rights reserved.</p>
//           <p className="text-white/20 text-xs">Built with Django + React + Firebase</p>
//         </div>
//       </div>
//     </footer>
//   )
// }

// // ─── Main Page ───────────────────────────────────────────────────────────────
// export default function HomePage() {
//   return (
//     <div className="min-h-screen bg-[#080808]">
//       {/* Playfair Display font */}
//       <link
//         rel="stylesheet"
//         href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,700;1,700&display=swap"
//       />
//       <Navbar />
//       <HeroSection />
//       <SearchBar />
//       <FeaturedCars />
//       <WhyUs />
//       <CTABanner />
//       <Footer />
//     </div>
//   )
// }

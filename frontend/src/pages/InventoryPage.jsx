import { useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  ArrowRight,
  Car,
  CalendarDays,
  Gauge,
  MapPin,
  Search,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react"
import { useSearchParams } from "react-router-dom"
import { useDealerships } from "../hooks/useDealerships"
import { useInventory } from "../hooks/useInventory"

const cn = (...classes) => classes.filter(Boolean).join(" ")

const FALLBACK_CARS = [
  {
    id: "m5-competition",
    make: "BMW",
    model: "M5 Competition",
    year: 2024,
    price: 115000,
    mileage: 0,
    fuel: "gasoline",
    transmission: "automatic",
    condition: "new",
    dealership_name: "AutoLux Madison",
    image: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=1000&q=85",
    is_featured: true,
    description: "A precise executive sedan with supercar pace, refined cabin materials, and a confident all-weather performance setup.",
  },
  {
    id: "gle-63",
    make: "Mercedes-Benz",
    model: "GLE 63 AMG",
    year: 2024,
    price: 132000,
    mileage: 1200,
    fuel: "hybrid",
    transmission: "automatic",
    condition: "certified",
    dealership_name: "AutoLux Beverly",
    image: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=1000&q=85",
    is_featured: true,
    description: "A commanding AMG SUV with hybrid assistance, a richly appointed interior, and long-distance comfort tuned for daily luxury.",
  },
  {
    id: "cayenne-turbo",
    make: "Porsche",
    model: "Cayenne Turbo",
    year: 2023,
    price: 147500,
    mileage: 8400,
    fuel: "gasoline",
    transmission: "automatic",
    condition: "certified",
    dealership_name: "AutoLux Design District",
    image: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=1000&q=85",
    is_featured: true,
    description: "A certified performance SUV with sharp road manners, generous cabin space, and the polish expected from Porsche's flagship utility line.",
  },
  {
    id: "rs7",
    make: "Audi",
    model: "RS7 Sportback",
    year: 2024,
    price: 126900,
    mileage: 0,
    fuel: "gasoline",
    transmission: "automatic",
    condition: "new",
    dealership_name: "AutoLux Beverly",
    image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=1000&q=85",
    is_featured: false,
    description: "A sculpted sportback with grand touring comfort, quattro traction, and a dramatic cabin built around performance driving.",
  },
  {
    id: "lc-500",
    make: "Lexus",
    model: "LC 500",
    year: 2023,
    price: 98500,
    mileage: 5200,
    fuel: "gasoline",
    transmission: "automatic",
    condition: "certified",
    dealership_name: "AutoLux Madison",
    image: "https://images.unsplash.com/photo-1621993202323-01f0fd7d0f86?w=1000&q=85",
    is_featured: false,
    description: "A low-mileage luxury coupe with naturally aspirated character, hand-finished details, and a relaxed grand touring personality.",
  },
  {
    id: "model-s-plaid",
    make: "Tesla",
    model: "Model S Plaid",
    year: 2024,
    price: 108990,
    mileage: 0,
    fuel: "electric",
    transmission: "single_speed",
    condition: "new",
    dealership_name: "AutoLux Design District",
    image: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=1000&q=85",
    is_featured: true,
    description: "An electric flagship with instant acceleration, quiet cruising, and a technology-forward cabin for modern luxury travel.",
  },
]

const FALLBACK_DEALERSHIPS = [
  { id: "nyc", name: "AutoLux Madison" },
  { id: "la", name: "AutoLux Beverly" },
  { id: "mia", name: "AutoLux Design District" },
]

const SORT_OPTIONS = [
  { label: "Newest first", value: "-created_at" },
  { label: "Price low to high", value: "price" },
  { label: "Price high to low", value: "-price" },
  { label: "Lowest mileage", value: "mileage" },
  { label: "Newest year", value: "-year" },
]

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

function normalizeList(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return []
}

function normalizeCar(car, dealerships) {
  const dealer = dealerships.find((item) => String(item.id) === String(car.dealership))
  return {
    ...car,
    price: Number(car.price || 0),
    mileage: Number(car.mileage || 0),
    year: Number(car.year || 0),
    image: car.primary_image || car.image || car.images?.[0]?.image,
    dealership_name: car.dealership_name || dealer?.name || car.dealership?.name || "AutoLux showroom",
    description: car.description || "A carefully selected AutoLux vehicle with verified details, premium presentation, and consultation support from our showroom team.",
  }
}

function buildApiParams(filters) {
  const params = { ordering: filters.sort }

  if (filters.make) params.make = filters.make
  if (filters.condition) params.condition = filters.condition
  if (filters.fuel) params.fuel = filters.fuel
  if (filters.dealership) params.dealership = filters.dealership
  if (filters.maxPrice) params.max_price = filters.maxPrice
  if (filters.query) params.search = filters.query

  return params
}

function applyClientFilters(cars, filters) {
  const term = filters.query.trim().toLowerCase()

  return cars.filter((car) => {
    const matchesQuery = !term || [car.make, car.model, car.year, car.fuel, car.condition, car.dealership_name]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(term))
    const matchesMake = !filters.make || car.make === filters.make
    const matchesCondition = !filters.condition || car.condition === filters.condition
    const matchesFuel = !filters.fuel || car.fuel === filters.fuel
    const matchesPrice = !filters.maxPrice || Number(car.price) <= Number(filters.maxPrice)

    return matchesQuery && matchesMake && matchesCondition && matchesFuel && matchesPrice
  })
}

function sortCars(cars, sort) {
  const sorted = [...cars]
  const direction = sort.startsWith("-") ? -1 : 1
  const field = sort.replace("-", "")

  return sorted.sort((a, b) => {
    const left = a[field]
    const right = b[field]
    if (left === right) return 0
    return left > right ? direction : -direction
  })
}

function InventoryHeader() {
  return (
    <header className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 pt-8">
      <a href="/" className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#C9A84C] rounded-sm flex items-center justify-center">
          <span className="text-black font-bold text-sm tracking-tighter">A</span>
        </div>
        <span className="text-white font-semibold tracking-widest text-sm uppercase">AutoLux</span>
      </a>

      <a href="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors">
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        Back home
      </a>
    </header>
  )
}

function FilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block">
      <span className="block text-white/35 text-xs uppercase tracking-[0.2em] mb-2">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full bg-white/[0.04] border border-white/10 rounded-sm px-3 py-3 text-sm text-white outline-none focus:border-[#C9A84C]/70 transition-colors"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-[#111111]">
            {option.label}
          </option>
        ))}
      </select>
    </label>
  )
}

function CarCard({ car, onOpen }) {
  return (
    <article className="group bg-[#101010] border border-white/10 rounded-sm overflow-hidden hover:border-[#C9A84C]/40 transition-colors">
      <button
        type="button"
        onClick={() => onOpen(car)}
        className="block w-full text-left"
      >
      <div className="relative aspect-[16/10] overflow-hidden bg-[#171717]">
        {car.image ? (
          <img
            src={car.image}
            alt={`${car.year} ${car.make} ${car.model}`}
            className="h-full w-full object-cover opacity-85 group-hover:scale-105 transition-transform duration-700"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-white/[0.03]">
            <Car className="w-12 h-12 text-white/20" strokeWidth={1.4} />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/85 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          <span className="text-xs px-2.5 py-1 rounded-sm border border-[#C9A84C]/25 bg-[#C9A84C]/15 text-[#C9A84C] font-medium">
            {titleCase(car.condition)}
          </span>
          {car.is_featured && (
            <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-sm border border-white/10 bg-black/55 text-white/70 backdrop-blur-sm">
              <Sparkles className="w-3 h-3" strokeWidth={1.7} />
              Featured
            </span>
          )}
        </div>
        <div className="absolute left-4 bottom-4">
          <p className="text-white/55 text-xs uppercase tracking-[0.25em] mb-1">{car.make}</p>
          <h2 className="text-white font-semibold text-xl leading-tight">
            {car.year} {car.model}
          </h2>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[#C9A84C] text-2xl font-bold">{formatCurrency(car.price)}</p>
            <p className="mt-1 text-white/35 text-sm">{car.mileage ? `${car.mileage.toLocaleString()} miles` : "Delivery mileage"}</p>
          </div>
          <span
            className="inline-flex h-10 w-10 items-center justify-center rounded-sm bg-white/[0.04] text-white/45 hover:bg-[#C9A84C] hover:text-black transition-colors"
          >
            <ArrowRight className="w-4 h-4" strokeWidth={1.8} />
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-5 pt-5 border-t border-white/10 text-sm">
          <div className="flex items-center gap-2 text-white/45">
            <Gauge className="w-4 h-4 text-white/25" strokeWidth={1.5} />
            {titleCase(car.transmission)}
          </div>
          <div className="flex items-center gap-2 text-white/45">
            <Car className="w-4 h-4 text-white/25" strokeWidth={1.5} />
            {titleCase(car.fuel)}
          </div>
          <div className="col-span-2 flex items-center gap-2 text-white/45">
            <MapPin className="w-4 h-4 text-white/25" strokeWidth={1.5} />
            {car.dealership_name}
          </div>
        </div>
      </div>
      </button>
    </article>
  )
}

function DetailItem({ label, value }) {
  return (
    <div className="border border-white/10 bg-white/[0.035] rounded-sm p-4">
      <p className="text-white/35 text-xs uppercase tracking-[0.22em] mb-2">{label}</p>
      <p className="text-white font-semibold">{value}</p>
    </div>
  )
}

function MagnifiedImage({ src, alt }) {
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
      {src ? (
        <>
          <img src={src} alt={alt} className="h-full w-full object-contain opacity-95" />

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
              backgroundImage: `url(${src})`,
              backgroundSize: `${zoom}% ${zoom}%`,
              backgroundPosition: `${lens.x}% ${lens.y}%`,
            }}
          >
            <div className="absolute inset-x-0 bottom-0 bg-black/55 backdrop-blur-sm px-3 py-2 text-[10px] uppercase tracking-[0.22em] text-[#C9A84C]">
              Detail view
            </div>
          </div>
        </>
      ) : (
        <Car className="w-16 h-16 text-white/20" strokeWidth={1.3} />
      )}
    </div>
  )
}

function CarPreviewModal({ car, onClose }) {
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
        aria-labelledby="vehicle-preview-title"
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
          <div className="relative min-h-[320px] lg:min-h-[620px] bg-[#151515]">
            <MagnifiedImage src={car.image} alt={`${car.year} ${car.make} ${car.model}`} />
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#080808] via-[#080808]/10 to-transparent" />
            <div className="absolute left-5 bottom-5 flex flex-wrap gap-2 pointer-events-none">
              <span className="text-xs px-3 py-1.5 rounded-sm border border-[#C9A84C]/25 bg-[#C9A84C]/15 text-[#C9A84C] font-medium">
                {titleCase(car.condition)}
              </span>
              {car.is_featured && (
                <span className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-sm border border-white/10 bg-black/50 text-white/70 backdrop-blur-sm">
                  <Sparkles className="w-3 h-3" strokeWidth={1.7} />
                  Featured selection
                </span>
              )}
            </div>
          </div>

          <div className="p-6 md:p-8 lg:p-10">
            <p className="text-[#C9A84C] text-xs tracking-[0.32em] uppercase mb-4">{car.make}</p>
            <h2
              id="vehicle-preview-title"
              className="text-4xl md:text-5xl font-bold leading-tight text-white"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              {car.year} {car.model}
            </h2>
            <p className="mt-4 text-[#C9A84C] text-3xl font-bold">{formatCurrency(car.price)}</p>
            <p className="mt-5 text-white/48 leading-relaxed">{car.description}</p>

            <div className="grid grid-cols-2 gap-3 mt-7">
              <DetailItem label="Mileage" value={car.mileage ? `${car.mileage.toLocaleString()} mi` : "Delivery"} />
              <DetailItem label="Fuel" value={titleCase(car.fuel)} />
              <DetailItem label="Transmission" value={titleCase(car.transmission)} />
              <DetailItem label="Location" value={car.dealership_name} />
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <div className="flex items-start gap-3 text-white/45 text-sm leading-relaxed">
                <MapPin className="w-4 h-4 mt-0.5 text-[#C9A84C] flex-shrink-0" strokeWidth={1.5} />
                <span>
                  Available through {car.dealership_name}. A specialist can confirm availability,
                  trade options, and appointment timing before your visit.
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
        </div>
      </section>
    </div>
  )
}

export default function InventoryPage() {
  const [searchParams] = useSearchParams()
  const [selectedCar, setSelectedCar] = useState(null)
  const [filters, setFilters] = useState({
    query: searchParams.get("q") || "",
    make: searchParams.get("make") && searchParams.get("make") !== "All Makes" ? searchParams.get("make") : "",
    condition: "",
    fuel: "",
    dealership: "",
    maxPrice: "",
    sort: "-created_at",
  })

  const { data: dealershipData } = useDealerships()
  const dealerships = normalizeList(dealershipData)
  const dealershipOptions = dealerships.length ? dealerships : FALLBACK_DEALERSHIPS
  const apiParams = useMemo(() => buildApiParams(filters), [filters])
  const { data, isLoading, isError } = useInventory(apiParams)
  const apiCars = normalizeList(data).map((car) => normalizeCar(car, dealerships))
  const usingFallback = !isLoading && (isError || apiCars.length === 0)
  const sourceCars = usingFallback ? FALLBACK_CARS : apiCars

  const makes = useMemo(() => [...new Set(sourceCars.map((car) => car.make).filter(Boolean))].sort(), [sourceCars])
  const visibleCars = useMemo(() => sortCars(applyClientFilters(sourceCars, filters), filters.sort), [sourceCars, filters])
  const featuredCount = visibleCars.filter((car) => car.is_featured).length
  const averagePrice = visibleCars.length
    ? Math.round(visibleCars.reduce((sum, car) => sum + Number(car.price || 0), 0) / visibleCars.length)
    : 0

  const setFilter = (key, value) => setFilters((current) => ({ ...current, [key]: value }))
  const clearFilters = () => setFilters({
    query: "",
    make: "",
    condition: "",
    fuel: "",
    dealership: "",
    maxPrice: "",
    sort: "-created_at",
  })

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <section className="relative overflow-hidden pb-16">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1542362567-b07e54358753?w=1800&q=85"
            alt="Luxury vehicle showroom"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/90 to-[#080808]/55" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/70" />
        </div>

        <InventoryHeader />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24">
          <div className="max-w-3xl">
            <div className="flex items-center gap-3 mb-7">
              <div className="h-px w-8 bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase">Available now</span>
            </div>
            <h1
              className="text-5xl md:text-7xl font-bold text-white leading-[0.95] mb-7"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Premium
              <br />
              <span className="text-[#C9A84C] italic">inventory</span>
            </h1>
            <p className="text-white/45 leading-relaxed max-w-xl">
              Search curated vehicles by body, price, condition, location, and powertrain.
              Every listing is organized around the decisions buyers actually make.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-12">
            <div className="border border-white/10 bg-[#101010]/80 backdrop-blur-sm rounded-sm p-5">
              <p className="text-3xl font-bold">{visibleCars.length}</p>
              <p className="text-white/35 text-xs uppercase tracking-widest mt-1">Matching vehicles</p>
            </div>
            <div className="border border-white/10 bg-[#101010]/80 backdrop-blur-sm rounded-sm p-5">
              <p className="text-3xl font-bold">{featuredCount}</p>
              <p className="text-white/35 text-xs uppercase tracking-widest mt-1">Featured picks</p>
            </div>
            <div className="border border-white/10 bg-[#101010]/80 backdrop-blur-sm rounded-sm p-5">
              <p className="text-3xl font-bold">{averagePrice ? formatCurrency(averagePrice) : "$0"}</p>
              <p className="text-white/35 text-xs uppercase tracking-widest mt-1">Average price</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">
          <aside className="lg:sticky lg:top-6 lg:self-start border border-white/10 bg-[#101010] rounded-sm p-5">
            <div className="flex items-center justify-between gap-4 mb-5">
              <div className="flex items-center gap-3">
                <SlidersHorizontal className="w-4 h-4 text-[#C9A84C]" strokeWidth={1.7} />
                <h2 className="text-white font-semibold">Refine search</h2>
              </div>
              <button type="button" onClick={clearFilters} className="text-xs text-white/35 hover:text-white transition-colors">
                Reset
              </button>
            </div>

            <div className="space-y-4">
              <label className="block">
                <span className="block text-white/35 text-xs uppercase tracking-[0.2em] mb-2">Search</span>
                <div className="flex items-center gap-3 bg-white/[0.04] border border-white/10 rounded-sm px-3 py-3 focus-within:border-[#C9A84C]/70 transition-colors">
                  <Search className="w-4 h-4 text-white/25" strokeWidth={1.6} />
                  <input
                    value={filters.query}
                    onChange={(event) => setFilter("query", event.target.value)}
                    placeholder="Make, model, keyword..."
                    className="w-full bg-transparent text-sm text-white placeholder-white/25 outline-none"
                  />
                </div>
              </label>

              <FilterSelect
                label="Make"
                value={filters.make}
                onChange={(value) => setFilter("make", value)}
                options={[{ label: "All makes", value: "" }, ...makes.map((make) => ({ label: make, value: make }))]}
              />

              <FilterSelect
                label="Condition"
                value={filters.condition}
                onChange={(value) => setFilter("condition", value)}
                options={[
                  { label: "All conditions", value: "" },
                  { label: "New", value: "new" },
                  { label: "Certified Pre-Owned", value: "certified" },
                  { label: "Used", value: "used" },
                ]}
              />

              <FilterSelect
                label="Fuel"
                value={filters.fuel}
                onChange={(value) => setFilter("fuel", value)}
                options={[
                  { label: "All fuel types", value: "" },
                  { label: "Gasoline", value: "gasoline" },
                  { label: "Diesel", value: "diesel" },
                  { label: "Hybrid", value: "hybrid" },
                  { label: "Electric", value: "electric" },
                ]}
              />

              <FilterSelect
                label="Dealership"
                value={filters.dealership}
                onChange={(value) => setFilter("dealership", value)}
                options={[
                  { label: "All locations", value: "" },
                  ...dealershipOptions.map((dealer) => ({ label: dealer.name, value: String(dealer.id) })),
                ]}
              />

              <label className="block">
                <span className="block text-white/35 text-xs uppercase tracking-[0.2em] mb-2">Max price</span>
                <input
                  type="number"
                  min="0"
                  step="5000"
                  value={filters.maxPrice}
                  onChange={(event) => setFilter("maxPrice", event.target.value)}
                  placeholder="No limit"
                  className="w-full bg-white/[0.04] border border-white/10 rounded-sm px-3 py-3 text-sm text-white placeholder-white/25 outline-none focus:border-[#C9A84C]/70 transition-colors"
                />
              </label>
            </div>
          </aside>

          <div>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase mb-2">Collection</p>
                <h2 className="text-2xl md:text-3xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
                  {visibleCars.length} vehicles found
                </h2>
              </div>
              <div className="w-full md:w-56">
                <FilterSelect
                  label="Sort"
                  value={filters.sort}
                  onChange={(value) => setFilter("sort", value)}
                  options={SORT_OPTIONS}
                />
              </div>
            </div>

            {usingFallback && (
              <p className="mb-5 text-sm text-white/35">
                Showing curated sample inventory until backend vehicle records are available.
              </p>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {[0, 1, 2, 3, 4, 5].map((item) => (
                  <div key={item} className="h-[420px] rounded-sm border border-white/10 bg-white/[0.03] animate-pulse" />
                ))}
              </div>
            ) : visibleCars.length ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {visibleCars.map((car) => (
                  <CarCard key={car.id} car={car} onOpen={setSelectedCar} />
                ))}
              </div>
            ) : (
              <div className="border border-white/10 bg-[#101010] rounded-sm py-16 px-6 text-center">
                <Search className="w-10 h-10 text-[#C9A84C] mx-auto mb-4" strokeWidth={1.5} />
                <h3 className="text-white font-semibold text-xl mb-2">No vehicles match those filters</h3>
                <p className="text-white/40 text-sm">Adjust the search, price, location, or condition to widen the collection.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <CarPreviewModal car={selectedCar} onClose={() => setSelectedCar(null)} />
    </main>
  )
}

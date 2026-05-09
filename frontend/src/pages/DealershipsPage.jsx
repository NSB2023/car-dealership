import { useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, Building2, CalendarDays, Car, Clock, Mail, MapPin, Phone, Search } from "lucide-react"
import { useDealerships } from "../hooks/useDealerships"

const cn = (...classes) => classes.filter(Boolean).join(" ")

const FALLBACK_DEALERSHIPS = [
  {
    id: "nyc",
    name: "AutoLux Madison",
    address: "415 Madison Avenue",
    city: "New York",
    state: "NY",
    zip_code: "10017",
    phone: "+1 (212) 555-0188",
    email: "madison@autolux.com",
    inventory_count: 148,
    image: "https://images.unsplash.com/photo-1563720223185-11003d516935?w=1000&q=85",
    specialty: "European performance",
  },
  {
    id: "la",
    name: "AutoLux Beverly",
    address: "9200 Wilshire Boulevard",
    city: "Beverly Hills",
    state: "CA",
    zip_code: "90212",
    phone: "+1 (310) 555-0144",
    email: "beverly@autolux.com",
    inventory_count: 126,
    image: "https://images.unsplash.com/photo-1532581140115-3e355d1ed1de?w=1000&q=85",
    specialty: "Luxury SUVs and grand tourers",
  },
  {
    id: "mia",
    name: "AutoLux Design District",
    address: "181 NE 40th Street",
    city: "Miami",
    state: "FL",
    zip_code: "33137",
    phone: "+1 (305) 555-0129",
    email: "miami@autolux.com",
    inventory_count: 94,
    image: "https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?w=1000&q=85",
    specialty: "Convertible and electric collections",
  },
]

function normalizeDealerships(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.results)) return data.results
  return []
}

function PageHeader() {
  return (
    <header className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 pt-8">
      <a href="/" className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#C9A84C] rounded-sm flex items-center justify-center">
          <span className="text-black font-bold text-sm tracking-tighter">A</span>
        </div>
        <span className="text-white font-semibold tracking-widest text-sm uppercase">AutoLux</span>
      </a>

      <a
        href="/"
        className="inline-flex items-center gap-2 text-white/50 hover:text-white text-sm transition-colors"
      >
        <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
        Back home
      </a>
    </header>
  )
}

function DealershipCard({ dealership, index }) {
  const image = dealership.image || FALLBACK_DEALERSHIPS[index % FALLBACK_DEALERSHIPS.length].image
  const specialty = dealership.specialty || "Premium sales and delivery"
  const inventoryCount = dealership.inventory_count ?? 0

  return (
    <article className="group bg-[#101010] border border-white/10 rounded-sm overflow-hidden hover:border-[#C9A84C]/35 transition-colors">
      <div className="relative aspect-[16/10] overflow-hidden bg-[#161616]">
        <img
          src={image}
          alt={dealership.name}
          className="h-full w-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/85 via-transparent to-transparent" />
        <div className="absolute left-4 top-4 text-xs px-3 py-1.5 bg-black/55 border border-white/10 rounded-sm text-white/70 backdrop-blur-sm">
          {specialty}
        </div>
        <div className="absolute left-4 bottom-4 flex items-center gap-2 text-[#C9A84C]">
          <Car className="w-4 h-4" strokeWidth={1.6} />
          <span className="text-sm font-semibold">{inventoryCount} vehicles</span>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <p className="text-[#C9A84C] text-xs tracking-[0.25em] uppercase mb-2">
              {dealership.city}, {dealership.state}
            </p>
            <h2 className="text-white font-semibold text-xl">{dealership.name}</h2>
          </div>
          <Building2 className="w-5 h-5 text-white/25 flex-shrink-0" strokeWidth={1.5} />
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3 text-white/45">
            <MapPin className="w-4 h-4 mt-0.5 text-white/25 flex-shrink-0" strokeWidth={1.5} />
            <span>{dealership.address}, {dealership.city}, {dealership.state} {dealership.zip_code}</span>
          </div>
          {dealership.phone && (
            <div className="flex items-center gap-3 text-white/45">
              <Phone className="w-4 h-4 text-white/25 flex-shrink-0" strokeWidth={1.5} />
              <span>{dealership.phone}</span>
            </div>
          )}
          {dealership.email && (
            <div className="flex items-center gap-3 text-white/45">
              <Mail className="w-4 h-4 text-white/25 flex-shrink-0" strokeWidth={1.5} />
              <span>{dealership.email}</span>
            </div>
          )}
        </div>

        <div className="mt-5 pt-5 border-t border-white/10 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-white/35 text-xs">
            <Clock className="w-4 h-4" strokeWidth={1.5} />
            Open by appointment
          </span>
          <a
            href="/contact"
            className="inline-flex items-center gap-2 text-[#C9A84C] text-sm font-medium hover:gap-3 transition-all"
          >
            Book visit
            <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
          </a>
        </div>
      </div>
    </article>
  )
}

export default function DealershipsPage() {
  const [query, setQuery] = useState("")
  const { data, isLoading, isError } = useDealerships()

  const apiDealerships = normalizeDealerships(data)
  const dealerships = apiDealerships.length ? apiDealerships : FALLBACK_DEALERSHIPS
  const usingFallback = !isLoading && !isError && apiDealerships.length === 0

  const filteredDealerships = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return dealerships
    return dealerships.filter((item) =>
      [item.name, item.city, item.state, item.address, item.zip_code]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    )
  }, [dealerships, query])

  return (
    <main className="min-h-screen bg-[#080808] text-white">
      <section className="relative overflow-hidden pb-20">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1610647752706-3bb12232b3ff?w=1800&q=85"
            alt="AutoLux dealership showroom"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/90 to-[#080808]/60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/60" />
        </div>

        <PageHeader />

        <div className="relative z-10 max-w-7xl mx-auto px-6 pt-24">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.72fr] gap-12 items-end">
            <div>
              <div className="flex items-center gap-3 mb-7">
                <div className="h-px w-8 bg-[#C9A84C]" />
                <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase">Our showrooms</span>
              </div>
              <h1
                className="text-5xl md:text-7xl font-bold text-white leading-[0.95] mb-7"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Visit an
                <br />
                <span className="text-[#C9A84C] italic">AutoLux salon</span>
              </h1>
              <p className="text-white/45 leading-relaxed max-w-xl">
                Explore curated inventory, private appointments, and white-glove delivery from
                our flagship dealership network.
              </p>
            </div>

            <div className="bg-[#101010]/85 backdrop-blur-md border border-white/10 rounded-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <Search className="w-4 h-4 text-[#C9A84C]" strokeWidth={1.7} />
                <p className="text-white text-sm font-semibold">Find a showroom</p>
              </div>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search city, state, or ZIP..."
                className="w-full bg-white/[0.04] border border-white/10 rounded-sm px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none focus:border-[#C9A84C]/70 transition-colors"
              />
              <div className="grid grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/10">
                <div>
                  <p className="text-2xl font-bold text-white">{dealerships.length}</p>
                  <p className="text-white/35 text-xs uppercase tracking-widest mt-1">Locations</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">
                    {dealerships.reduce((sum, item) => sum + Number(item.inventory_count || 0), 0)}
                  </p>
                  <p className="text-white/35 text-xs uppercase tracking-widest mt-1">Vehicles</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">24h</p>
                  <p className="text-white/35 text-xs uppercase tracking-widest mt-1">Support</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-6 pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <p className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase mb-3">Network</p>
              <h2
                className="text-3xl md:text-4xl font-bold text-white"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Dealership locations
              </h2>
            </div>
            {usingFallback && (
              <p className="text-white/35 text-sm max-w-md">
                Showing curated sample locations until dealership records are added in the backend.
              </p>
            )}
            {isError && (
              <p className="text-red-300/70 text-sm max-w-md">
                Could not load dealerships from the API. Showing sample locations for now.
              </p>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-[430px] rounded-sm border border-white/10 bg-white/[0.03] animate-pulse" />
              ))}
            </div>
          ) : filteredDealerships.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredDealerships.map((dealership, index) => (
                <DealershipCard key={dealership.id || dealership.name} dealership={dealership} index={index} />
              ))}
            </div>
          ) : (
            <div className="border border-white/10 bg-[#101010] rounded-sm py-16 px-6 text-center">
              <MapPin className="w-10 h-10 text-[#C9A84C] mx-auto mb-4" strokeWidth={1.5} />
              <h3 className="text-white font-semibold text-xl mb-2">No locations found</h3>
              <p className="text-white/40 text-sm">Try another city, state, or ZIP code.</p>
            </div>
          )}
        </div>
      </section>

      <section className="relative overflow-hidden border-t border-white/5 bg-[#0d0d0d] px-6 py-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px w-8 bg-[#C9A84C]" />
              <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase">Private appointment</span>
            </div>
            <h2
              className="text-3xl md:text-5xl font-bold text-white mb-4"
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
            >
              Let us prepare the showroom for you.
            </h2>
            <p className="text-white/40 max-w-2xl leading-relaxed">
              Tell us what you want to see and we will arrange vehicles, valuation support,
              financing guidance, and delivery options before you arrive.
            </p>
          </div>
          <a
            href="/contact"
            className="inline-flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#D4B86A] text-black font-semibold px-7 py-4 rounded-sm text-sm tracking-wide transition-colors"
          >
            Schedule visit
            <CalendarDays className="w-4 h-4" strokeWidth={1.7} />
          </a>
        </div>
      </section>
    </main>
  )
}

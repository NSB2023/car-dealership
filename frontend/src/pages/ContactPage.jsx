import { useState } from "react"
import { ArrowLeft, CheckCircle2, Clock, Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react"

const cn = (...classes) => classes.filter(Boolean).join(" ")

function ContactField({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-white/45 tracking-widest uppercase mb-2">
        {label}
      </span>
      {children}
    </label>
  )
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="w-full bg-white/[0.04] border border-white/10 rounded-sm px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-[#C9A84C]/70"
    />
  )
}

function ContactMethod({ icon: Icon, title, value, detail }) {
  return (
    <div className="group border-t border-white/10 pt-5">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 rounded-sm bg-[#C9A84C]/10 border border-[#C9A84C]/20 text-[#C9A84C] flex items-center justify-center group-hover:bg-[#C9A84C] group-hover:text-black transition-colors">
          <Icon className="w-4 h-4" strokeWidth={1.7} />
        </div>
        <div>
          <h3 className="text-white text-sm font-semibold mb-1">{title}</h3>
          <p className="text-white/55 text-sm">{value}</p>
          <p className="text-white/30 text-xs mt-1">{detail}</p>
        </div>
      </div>
    </div>
  )
}

export default function ContactPage() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (event) => {
    event.preventDefault()
    setSent(true)
  }

  return (
    <main className="min-h-screen bg-[#080808] text-white overflow-hidden">
      <section className="relative min-h-screen px-6 py-8 lg:py-10">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=1800&q=85"
            alt="Premium correspondence on a desk"
            className="w-full h-full object-cover opacity-25"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/92 to-[#080808]/70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/70" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto">
          <header className="flex items-center justify-between mb-16">
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

          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-12 lg:gap-16 items-start">
            <div className="pt-4 lg:pt-12">
              <div className="flex items-center gap-3 mb-7">
                <div className="h-px w-8 bg-[#C9A84C]" />
                <span className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase">Contact AutoLux</span>
              </div>

              <h1
                className="text-5xl md:text-7xl font-bold text-white leading-[0.95] mb-7"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                Send us a
                <br />
                <span className="text-[#C9A84C] italic">private note</span>
              </h1>

              <p className="text-white/45 leading-relaxed max-w-xl mb-12">
                Whether you are sourcing a specific model, planning a trade, or arranging a private viewing,
                our client team will respond with the right next step.
              </p>

              <div className="max-w-lg space-y-5">
                <ContactMethod
                  icon={Mail}
                  title="Email concierge"
                  value="concierge@autolux.com"
                  detail="For appointments, vehicle sourcing, and purchase guidance"
                />
                <ContactMethod
                  icon={Phone}
                  title="Client line"
                  value="+1 (212) 555-0188"
                  detail="Available Monday to Saturday, 9:00 AM to 7:00 PM"
                />
                <ContactMethod
                  icon={MapPin}
                  title="Flagship showroom"
                  value="415 Madison Avenue, New York"
                  detail="Private viewings by appointment"
                />
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-[#C9A84C]/50 to-transparent hidden lg:block" />

              <div className="grid grid-cols-1 xl:grid-cols-[0.88fr_1.12fr] gap-5">
                <div className="relative min-h-[360px] overflow-hidden rounded-sm border border-white/10 bg-[#111111] hidden xl:block">
                  <img
                    src="https://images.unsplash.com/photo-1516387938699-a93567ec168e?w=900&q=85"
                    alt="A written message prepared for mailing"
                    className="absolute inset-0 h-full w-full object-cover opacity-80"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080808]/95 via-transparent to-transparent" />
                  <div className="absolute left-5 right-5 bottom-5">
                    <div className="border border-white/10 bg-[#080808]/80 backdrop-blur-md rounded-sm p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-8 h-8 rounded-sm bg-[#C9A84C] text-black flex items-center justify-center">
                          <MessageSquare className="w-4 h-4" strokeWidth={1.7} />
                        </div>
                        <p className="text-white text-sm font-semibold">Personal replies</p>
                      </div>
                      <p className="text-white/40 text-sm leading-relaxed">
                        Every inquiry is reviewed by a dedicated AutoLux advisor.
                      </p>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={handleSubmit}
                  className="border border-white/10 bg-[#0d0d0d]/90 backdrop-blur-md rounded-sm p-5 sm:p-7 shadow-2xl"
                >
                  <div className="flex items-start justify-between gap-4 mb-8">
                    <div>
                      <p className="text-[#C9A84C] text-xs tracking-[0.3em] uppercase mb-3">Inquiry</p>
                      <h2
                        className="text-3xl font-bold text-white"
                        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                      >
                        Start the conversation
                      </h2>
                    </div>
                    <div className="w-11 h-11 rounded-sm border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C] flex items-center justify-center flex-shrink-0">
                      <Mail className="w-5 h-5" strokeWidth={1.5} />
                    </div>
                  </div>

                  {sent ? (
                    <div className="min-h-[420px] flex flex-col items-center justify-center text-center border border-[#C9A84C]/20 bg-[#C9A84C]/5 rounded-sm px-6">
                      <CheckCircle2 className="w-12 h-12 text-[#C9A84C] mb-5" strokeWidth={1.5} />
                      <h3 className="text-white font-semibold text-xl mb-3">Message received</h3>
                      <p className="text-white/45 text-sm leading-relaxed max-w-sm mb-7">
                        Thank you. An AutoLux advisor will follow up with you shortly.
                      </p>
                      <button
                        type="button"
                        onClick={() => setSent(false)}
                        className="border border-white/15 hover:border-[#C9A84C]/50 text-white/65 hover:text-white px-5 py-3 rounded-sm text-sm transition-colors"
                      >
                        Send another message
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ContactField label="Name">
                          <TextInput required placeholder="Your name" />
                        </ContactField>
                        <ContactField label="Email">
                          <TextInput required type="email" placeholder="you@example.com" />
                        </ContactField>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <ContactField label="Phone">
                          <TextInput placeholder="+1 555 000 0000" />
                        </ContactField>
                        <ContactField label="Interest">
                          <select
                            defaultValue="Private viewing"
                            className="w-full bg-white/[0.04] border border-white/10 rounded-sm px-4 py-3.5 text-sm text-white outline-none transition-colors focus:border-[#C9A84C]/70"
                          >
                            {["Private viewing", "Vehicle sourcing", "Trade-in", "Financing", "General inquiry"].map((item) => (
                              <option key={item} value={item} className="bg-[#111111]">
                                {item}
                              </option>
                            ))}
                          </select>
                        </ContactField>
                      </div>

                      <ContactField label="Message">
                        <textarea
                          required
                          rows={6}
                          placeholder="Tell us what you are looking for..."
                          className="w-full resize-none bg-white/[0.04] border border-white/10 rounded-sm px-4 py-3.5 text-sm text-white placeholder-white/25 outline-none transition-colors focus:border-[#C9A84C]/70"
                        />
                      </ContactField>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
                        <div className="flex items-center gap-2 text-white/30 text-xs">
                          <Clock className="w-4 h-4" strokeWidth={1.5} />
                          Replies usually arrive within one business day.
                        </div>
                        <button
                          type="submit"
                          className="inline-flex items-center justify-center gap-2 bg-[#C9A84C] hover:bg-[#D4B86A] text-black font-semibold px-6 py-3.5 rounded-sm text-sm tracking-wide transition-colors"
                        >
                          Send message
                          <Send className="w-4 h-4" strokeWidth={1.7} />
                        </button>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}

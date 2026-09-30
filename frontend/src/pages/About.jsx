import { motion } from 'framer-motion'
import { Globe, Shield, Heart, Sparkles, Award, Users } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

export default function About() {
  const values = [
    { icon: Globe, title: 'Global Reach', desc: 'Access destinations and experiences across every continent, from popular hotspots to hidden gems.' },
    { icon: Shield, title: 'Trust & Safety', desc: 'Every booking is secured, every guide is verified, and your data is always protected.' },
    { icon: Heart, title: 'Passion for Travel', desc: 'Built by travelers, for travelers. We know what makes a trip truly unforgettable.' },
    { icon: Sparkles, title: 'Seamless Experience', desc: 'Hotels, tickets, and guides in one platform — no more juggling multiple booking sites.' },
    { icon: Award, title: 'Quality First', desc: 'We curate and verify every listing to ensure you get the best possible experience.' },
    { icon: Users, title: 'Community Driven', desc: 'Real ratings and reviews from fellow travelers to guide your decisions.' },
  ]

  return (
    <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.08 }} className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden py-20 px-4" style={{ background: 'var(--gradient-hero)' }}>
        <div className="absolute top-10 left-10 w-72 h-72 rounded-full opacity-15 blur-3xl" style={{ background: '#6366f1' }} />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.span variants={fadeUp} className="badge badge-primary mb-4">About Us</motion.span>
          <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl font-extrabold font-heading text-white mb-6">
            Making Travel <span className="gradient-text">Effortless</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg max-w-2xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            Wanderlust was born from a simple idea: planning a trip should be as exciting as the trip itself.
            We combine the best destinations, hotels, tickets, and local guides into one beautiful, easy-to-use platform.
          </motion.p>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div variants={fadeUp} className="glass rounded-3xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold font-heading text-white mb-4">Our Mission</h2>
          <p className="text-lg max-w-3xl mx-auto" style={{ color: 'var(--color-text-muted)' }}>
            To be the single entry point for planning and booking a trip — from discovery to checkout.
            We empower travelers to explore confidently, book seamlessly, and experience authentically,
            no matter where in the world they're headed.
          </p>
        </motion.div>
      </section>

      {/* Values */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <motion.div variants={fadeUp} className="text-center mb-12">
          <h2 className="text-3xl font-bold font-heading text-white mb-3">
            What We <span className="gradient-text">Stand For</span>
          </h2>
          <p style={{ color: 'var(--color-text-muted)' }}>The principles that guide everything we do</p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {values.map((v, i) => (
            <motion.div key={v.title} variants={fadeUp} transition={{ delay: i * 0.08 }}>
              <div className="card p-6 h-full">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: 'rgba(99,102,241,0.1)' }}>
                  <v.icon size={24} className="text-indigo-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{v.title}</h3>
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{v.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="glass rounded-3xl p-8 sm:p-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '10+', label: 'Destinations' },
              { value: '25+', label: 'Partner Hotels' },
              { value: '50+', label: 'Experiences' },
              { value: '30+', label: 'Expert Guides' },
            ].map((stat) => (
              <motion.div key={stat.label} variants={fadeUp}>
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">{stat.value}</div>
                <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  )
}

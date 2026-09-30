import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, Send, MapPin, Phone, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import api from '../services/api'

const fadeUp = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

export default function Contact() {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      await api.post('/contact', data)
      toast.success('Message sent! We\'ll get back to you soon.')
      reset()
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Failed to send message')
    }
  }

  const contactInfo = [
    { icon: Mail, label: 'Email', value: 'hello@wanderlust.travel' },
    { icon: Phone, label: 'Phone', value: '+1 (555) 123-4567' },
    { icon: MapPin, label: 'Location', value: 'San Francisco, CA' },
    { icon: Clock, label: 'Hours', value: 'Mon–Fri, 9am–6pm PST' },
  ]

  return (
    <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.08 }} className="min-h-screen">
      <div className="py-10 px-4" style={{ background: 'linear-gradient(180deg, var(--color-surface-light), var(--color-surface))' }}>
        <div className="max-w-7xl mx-auto text-center">
          <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl font-bold font-heading text-white mb-2">
            Get in <span className="gradient-text">Touch</span>
          </motion.h1>
          <motion.p variants={fadeUp} style={{ color: 'var(--color-text-muted)' }}>
            Have a question or feedback? We'd love to hear from you.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          {/* Contact Info */}
          <motion.div variants={fadeUp} className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white font-heading mb-4">Contact Information</h2>
            {contactInfo.map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-4 p-4 rounded-xl"
                style={{ background: 'var(--color-surface-light)', border: '1px solid var(--color-border)' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'rgba(99,102,241,0.1)' }}>
                  <Icon size={18} className="text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{label}</p>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{value}</p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Form */}
          <motion.div variants={fadeUp} className="lg:col-span-3">
            <div className="glass rounded-2xl p-8" style={{ boxShadow: 'var(--shadow-glow)' }}>
              <h2 className="text-xl font-bold text-white font-heading mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Name</label>
                    <input {...register('name')} className="input-field" placeholder="Your name" id="contact-name" />
                    {errors.name && <p className="input-error">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label className="input-label">Email</label>
                    <input {...register('email')} type="email" className="input-field" placeholder="you@example.com" id="contact-email" />
                    {errors.email && <p className="input-error">{errors.email.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="input-label">Message</label>
                  <textarea {...register('message')} rows={5} className="input-field" placeholder="How can we help?"
                    id="contact-message" style={{ resize: 'vertical' }} />
                  {errors.message && <p className="input-error">{errors.message.message}</p>}
                </div>
                <button type="submit" disabled={isSubmitting} className="btn-primary" id="contact-submit"
                  style={{ opacity: isSubmitting ? 0.7 : 1 }}>
                  <Send size={16} /> {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}

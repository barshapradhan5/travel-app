import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { UserPlus, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAuth } from '../context/AuthContext'

const schema = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

export default function Signup() {
  const [showPw, setShowPw] = useState(false)
  const { register: authRegister, login } = useAuth()
  const navigate = useNavigate()

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
  })

  const onSubmit = async (data) => {
    try {
      await authRegister(data.name, data.email, data.password)
      await login(data.email, data.password)
      toast.success('Account created! Welcome aboard!')
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.error?.message || 'Registration failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16" style={{ background: 'var(--gradient-hero)' }}>
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-15 blur-3xl" style={{ background: '#8b5cf6' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-3xl p-8 sm:p-10 w-full max-w-md relative"
        style={{ boxShadow: '0 0 80px rgba(99,102,241,0.1)' }}
      >
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--gradient-primary)' }}>
            <UserPlus size={26} color="white" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-white">Create Account</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>Start your travel adventure today</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="input-label">Full Name</label>
            <input {...register('name')} type="text" className="input-field" placeholder="John Doe" id="signup-name" />
            {errors.name && <p className="input-error">{errors.name.message}</p>}
          </div>
          <div>
            <label className="input-label">Email</label>
            <input {...register('email')} type="email" className="input-field" placeholder="you@example.com" id="signup-email" />
            {errors.email && <p className="input-error">{errors.email.message}</p>}
          </div>
          <div>
            <label className="input-label">Password</label>
            <div className="relative">
              <input {...register('password')} type={showPw ? 'text' : 'password'} className="input-field" placeholder="••••••••" id="signup-password" style={{ paddingRight: '2.5rem' }} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer"
                style={{ color: 'var(--color-text-dim)' }}>
                {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && <p className="input-error">{errors.password.message}</p>}
          </div>
          <div>
            <label className="input-label">Confirm Password</label>
            <input {...register('confirmPassword')} type="password" className="input-field" placeholder="••••••••" id="signup-confirm" />
            {errors.confirmPassword && <p className="input-error">{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full" id="signup-submit"
            style={{ opacity: isSubmitting ? 0.7 : 1 }}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">Sign in</Link>
        </p>
      </motion.div>
    </div>
  )
}

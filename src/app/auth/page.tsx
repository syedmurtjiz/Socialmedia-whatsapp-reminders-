'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { FiEye, FiEyeOff, FiMail, FiLock, FiUser, FiCheck, FiShield, FiZap, FiStar } from 'react-icons/fi'
import Link from 'next/link'
import ThemeToggle from '@/components/ui/ThemeToggle'
import Image from 'next/image'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: ''
  })
  const [error, setError] = useState('')
  const router = useRouter()
  const { signIn, signUp } = useAuth()

  // Mouse parallax motion values
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  const springConfig = { damping: 25, stiffness: 150 }
  const springX = useSpring(mouseX, springConfig)
  const springY = useSpring(mouseY, springConfig)

  const translateX = useTransform(springX, [-500, 500], [-20, 20])
  const translateY = useTransform(springY, [-500, 500], [-20, 20])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const moveX = clientX - window.innerWidth / 2
      const moveY = clientY - window.innerHeight / 2
      mouseX.set(moveX)
      mouseY.set(moveY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isLogin) {
        const { error } = await signIn(formData.email, formData.password)
        if (error) {
          setError(error)
        } else {
          router.push('/dashboard')
        }
      } else {
        if (!formData.fullName.trim()) {
          setError('Full name is required')
          return
        }
        const { error } = await signUp(formData.email, formData.password, formData.fullName)
        if (error) {
          setError(error)
        } else {
          router.push('/dashboard')
        }
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const features = [
    { icon: FiZap, text: 'Never miss a subscription payment', color: 'text-yellow-400' },
    { icon: FiShield, text: 'Secure & encrypted data', color: 'text-blue-400' },
    { icon: FiCheck, text: 'Smart WhatsApp reminders', color: 'text-green-400' },
    { icon: FiStar, text: 'Track unlimited subscriptions', color: 'text-purple-400' }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden bg-white dark:bg-chocolate-950 transition-colors duration-500">
      {/* Theme Toggle */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="absolute top-6 right-6 z-50"
      >
        <ThemeToggle />
      </motion.div>

      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Immersive Background */}
        <motion.div
          style={{ x: translateX, y: translateY }}
          className="absolute inset-0 z-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 dark:from-chocolate-900 dark:via-chocolate-950 dark:to-dark-900"
        >
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

          {/* Animated Glow Loops */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.5, 0.3],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -top-1/4 -left-1/4 w-[150%] h-[150%] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)]"
          />
        </motion.div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-16 text-white w-full">
          {/* Logo Section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <Image
              src="/logo.png"
              alt="Due Pilot Logo"
              width={160}
              height={160}
              className="object-contain"
              priority
            />
          </motion.div>

          {/* Features Illustration */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-10"
          >
            <h2 className="text-3xl font-bold max-w-sm leading-tight">
              Master your financial universe with one intelligent platform.
            </h2>
            <div className="grid gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  variants={itemVariants}
                  whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.05)' }}
                  className="flex items-center space-x-6 p-4 rounded-2xl transition-colors cursor-default"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg ${feature.color}`}>
                    <feature.icon className="w-7 h-7" />
                  </div>
                  <p className="text-xl font-medium text-white/90">{feature.text}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Testimonial Placeholder */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="p-8 rounded-3xl bg-black/20 backdrop-blur-sm border border-white/5"
          >
            <p className="text-white/70 italic mb-4">&quot;The WhatsApp integration changed the game. I&apos;ve saved over $400 in forgotten subscriptions this year alone.&quot;</p>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-primary-400"></div>
              <div>
                <p className="font-bold text-sm">Marcus Chen</p>
                <p className="text-white/40 text-xs tracking-wider">PREMIUM USER</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 dark:bg-chocolate-950 relative">
        <div className="w-full max-w-md relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.05, y: -20 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
              className="bg-white dark:bg-chocolate-900 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] dark:shadow-none p-10 lg:p-12 border border-gray-100 dark:border-chocolate-800 backdrop-blur-3xl"
            >
              <div className="text-center mb-10">
                {/* Mobile Logo */}
                <div className="lg:hidden flex justify-center mb-8">
                  <Image
                    src="/logo.png"
                    alt="Due Pilot Logo"
                    width={160}
                    height={160}
                    className="object-contain"
                  />
                </div>
                <motion.h2
                  layoutId="auth-title"
                  className="text-4xl font-black text-gray-900 dark:text-white mb-3"
                >
                  {isLogin ? 'Welcome Home' : 'Join the Elite'}
                </motion.h2>
                <motion.p
                  layoutId="auth-subtitle"
                  className="text-gray-500 dark:text-chocolate-400 font-medium"
                >
                  {isLogin ? 'Please enter your account details.' : 'Start your journey to financial freedom.'}
                </motion.p>
              </div>



              <form onSubmit={handleSubmit} className="space-y-6">
                {!isLogin && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="overflow-hidden"
                  >
                    <div className="relative group">
                      <FiUser className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${focusedField === 'fullName' ? 'text-primary-600' : 'text-gray-400'
                        }`} />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        onFocus={() => setFocusedField('fullName')}
                        onBlur={() => setFocusedField(null)}
                        className="w-full pl-14 pr-6 py-5 bg-gray-50/50 dark:bg-chocolate-800 border-2 border-transparent focus:border-primary-500 rounded-[1.25rem] text-gray-900 dark:text-white transition-all outline-none font-medium placeholder:text-gray-400 dark:placeholder:text-chocolate-500"
                        placeholder="Premium Member Name"
                      />
                    </div>
                  </motion.div>
                )}

                <div className="relative group">
                  <FiMail className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${focusedField === 'email' ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-14 pr-6 py-5 bg-gray-50/50 dark:bg-chocolate-800 border-2 border-transparent focus:border-primary-500 rounded-[1.25rem] text-gray-900 dark:text-white transition-all outline-none font-medium placeholder:text-gray-400 dark:placeholder:text-chocolate-500"
                    placeholder="E-mail Address"
                  />
                </div>

                <div className="relative group">
                  <FiLock className={`absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 transition-all duration-300 ${focusedField === 'password' ? 'text-primary-600' : 'text-gray-400'
                    }`} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full pl-14 pr-14 py-5 bg-gray-50/50 dark:bg-chocolate-800 border-2 border-transparent focus:border-primary-500 rounded-[1.25rem] text-gray-900 dark:text-white transition-all outline-none font-medium placeholder:text-gray-400 dark:placeholder:text-chocolate-500"
                    placeholder="Secure Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary-600 transition-colors"
                  >
                    {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
                  </button>
                </div>

                {isLogin && (
                  <div className="flex justify-end">
                    <Link href="/auth/forgot-password" title="Recover Password"
                      className="text-xs uppercase tracking-widest font-black text-primary-600 hover:text-primary-700 transition-colors"
                    >
                      Forgot?
                    </Link>
                  </div>
                )}

                {error && (
                  <motion.div
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-100 dark:border-red-800/30"
                  >
                    <p className="text-red-600 dark:text-red-400 text-sm font-bold flex items-center space-x-2">
                      <span>{error}</span>
                    </p>
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full relative py-5 bg-gradient-to-r from-primary-600 to-primary-500 text-white font-black uppercase tracking-[0.2em] rounded-[1.25rem] shadow-[0_20px_40px_-10px_rgba(242,119,12,0.3)] hover:shadow-[0_25px_50px_-12px_rgba(242,119,12,0.5)] transition-all overflow-hidden"
                >
                  <span className="relative z-10">{loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Join Elite')}</span>
                  <motion.div
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                  />
                </motion.button>
              </form>

              <div className="mt-12 text-center">
                <button
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-sm font-medium text-gray-500 dark:text-chocolate-400 group"
                >
                  {isLogin ? "Don't have an elite account?" : "Already a member?"}
                  <span className="ml-2 text-primary-600 font-black uppercase tracking-widest group-hover:underline underline-offset-4 decoration-2">
                    {isLogin ? 'Register' : 'Login'}
                  </span>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-8 text-center text-[10px] uppercase tracking-[0.4em] font-black text-gray-400 dark:text-chocolate-600"
          >
            © 2025 Due Pilot Elite • All Rights Reserved
          </motion.div>
        </div>

        {/* Floating Decorative Blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/5 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px] pointer-events-none"></div>
      </div>
    </div>
  )
}
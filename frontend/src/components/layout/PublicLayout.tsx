import { motion } from 'framer-motion'
import { Outlet, useLocation } from 'react-router-dom'

import { Footer } from './Footer'
import { Header } from './Header'

export const PublicLayout = () => {
  const { pathname } = useLocation()

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <motion.main
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        className="mx-auto w-full max-w-5xl flex-1 px-4 py-10"
      >
        <Outlet />
      </motion.main>
      <Footer />
    </div>
  )
}

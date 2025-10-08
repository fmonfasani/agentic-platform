import { motion } from 'framer-motion'
import { PropsWithChildren } from 'react'

export default function GlowHover({ children }: PropsWithChildren) {
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ duration: 0.15 }} className="relative">
      {children}
    </motion.div>
  )
}

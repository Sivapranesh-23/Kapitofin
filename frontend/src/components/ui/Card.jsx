import { motion } from 'framer-motion'

export default function Card({ children, className = '', hover = false, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`card ${hover ? 'hover:shadow-md transition-shadow cursor-pointer' : ''} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

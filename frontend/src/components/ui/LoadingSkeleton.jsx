import { motion } from 'framer-motion'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

export default function LoadingSkeleton({ rows = 5, className = '' }) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className={`space-y-3 ${className}`}
    >
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          key={i}
          variants={{ hidden: { opacity: 0 }, show: { opacity: 1 } }}
          className="animate-pulse"
        >
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        </motion.div>
      ))}
    </motion.div>
  )
}

export function CardSkeleton() {
  return (
    <div className="card animate-pulse">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3" />
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
    </div>
  )
}

export function TableSkeleton({ cols = 5, rows = 5 }) {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={ri} className="flex gap-4 px-4 py-4 border-b border-gray-100 dark:border-gray-800">
          {Array.from({ length: cols }).map((_, ci) => (
            <div key={ci} className="h-3 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
          ))}
        </div>
      ))}
    </div>
  )
}

import { cn, getStatusColor } from '../../lib/utils'

export default function Badge({ children, variant, status, className = '' }) {
  const colorClass = status ? getStatusColor(status) : {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    primary: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  }[variant || 'default']

  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', colorClass, className)}>
      {children}
    </span>
  )
}

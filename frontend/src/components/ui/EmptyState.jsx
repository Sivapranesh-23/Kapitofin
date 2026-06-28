import { FileText } from 'lucide-react'

export default function EmptyState({ icon: Icon = FileText, title = 'No data found', description = '', action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
        <Icon size={28} className="text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-sm mb-4">{description}</p>
      )}
      {action && (
        <button onClick={action} className="btn-primary">
          {actionLabel || 'Take Action'}
        </button>
      )}
    </div>
  )
}

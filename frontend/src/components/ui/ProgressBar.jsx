import { getUtilColor, cn, formatPercent } from '../../lib/utils'

export default function ProgressBar({ value = 0, max = 100, showLabel = true, size = 'md', className = '' }) {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0
  const barColor = getUtilColor(pct)

  const heights = { sm: 'h-1.5', md: 'h-2.5', lg: 'h-4' }

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
          <span>{formatPercent(pct)} utilized</span>
          <span>{100 - pct.toFixed(1)}% remaining</span>
        </div>
      )}
      <div className={cn('w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500 ease-out', barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

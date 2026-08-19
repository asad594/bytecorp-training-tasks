export function formatRelativeTime(dateString) {
  if (!dateString) return 'Recently'
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Recently'

  const now = new Date()
  const diffMs = now - date
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffHours / 24)

  if (diffHours < 1) return 'Just now'
  if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`
  if (diffDays < 30) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`
  return 'Recently'
}

export function formatSalary(min, max) {
  if (min && max) {
    const minK = (min / 1000).toFixed(0)
    const maxK = (max / 1000).toFixed(0)
    return `$${minK}k - $${maxK}k`
  }
  if (min) {
    return `$${(min / 1000).toFixed(0)}k+`
  }
  return 'Competitive'
}

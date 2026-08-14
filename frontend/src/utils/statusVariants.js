export function getApplicationStatusVariant(status) {
  switch (status) {
    case 'shortlisted':
      return 'emerald'
    case 'rejected':
      return 'rose'
    case 'reviewed':
      return 'indigo'
    default:
      return 'amber'
  }
}

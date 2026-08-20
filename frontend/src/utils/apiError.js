/**
 * Centralized API Error Parser for Axios responses
 * Replicates and standardizes error parsing across all forms.
 *
 * @param {any} error - Axios error object or generic Error
 * @returns {{ general: string, fieldErrors: Record<string, string> }}
 */
export function parseApiError(error) {
  let general = ''
  const fieldErrors = {}

  if (!error) {
    return { general: 'Something went wrong. Please try again.', fieldErrors }
  }

  if (!error.response) {
    return {
      general:
        error.message ||
        'Unable to connect to the backend server. Please ensure the Django server is running.',
      fieldErrors,
    }
  }

  const data = error.response.data

  if (data) {
    if (typeof data === 'string') {
      general = data
    } else if (data.error) {
      if (data.error.details && typeof data.error.details === 'object') {
        const fieldMsgs = []
        for (const [field, msgs] of Object.entries(data.error.details)) {
          const text = Array.isArray(msgs) ? msgs.join(' ') : String(msgs)
          fieldErrors[field] = text
          fieldMsgs.push(`${field}: ${text}`)
        }
        if (fieldMsgs.length > 0) {
          general = fieldMsgs.join(' | ')
        }
      }
      if (!general && typeof data.error.message === 'string') {
        general = data.error.message
      }
    } else if (typeof data.detail === 'string') {
      general = data.detail
    } else if (data.non_field_errors) {
      general = Array.isArray(data.non_field_errors)
        ? data.non_field_errors.join(' ')
        : String(data.non_field_errors)
    } else if (typeof data.message === 'string') {
      general = data.message
    } else if (typeof data === 'object') {
      const fieldMsgs = []
      for (const [field, msgs] of Object.entries(data)) {
        const text = Array.isArray(msgs) ? msgs.join(' ') : String(msgs)
        fieldErrors[field] = text
        fieldMsgs.push(`${field}: ${text}`)
      }
      if (fieldMsgs.length > 0) {
        general = fieldMsgs.join(' | ')
      }
    }
  }

  if (!general && Object.keys(fieldErrors).length === 0) {
    general = 'Something went wrong. Please try again.'
  }

  return { general, fieldErrors }
}

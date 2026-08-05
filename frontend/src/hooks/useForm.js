import { useState } from 'react'

export default function useForm(initialValues = {}, onSubmit) {
  const [form, setForm] = useState(initialValues)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    const val = type === 'checkbox' ? checked : value
    setForm((prev) => ({ ...prev, [name]: val }))

    if (errors[name] || errors.general) {
      setErrors((prev) => ({ ...prev, [name]: '', general: '' }))
    }
  }

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault()
    setLoading(true)
    setErrors({})

    try {
      if (onSubmit) {
        await onSubmit(form, { setErrors, setForm, setLoading })
      }
    } catch (err) {
      setErrors({ general: err.message || 'Something went wrong.' })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setForm(initialValues)
    setErrors({})
    setLoading(false)
  }

  return {
    form,
    errors,
    loading,
    handleChange,
    handleSubmit,
    resetForm,
    setForm,
    setErrors,
    setLoading,
  }
}

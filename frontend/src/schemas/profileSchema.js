import * as Yup from 'yup'

export const profileSchema = Yup.object().shape({
  bio: Yup.string()
    .trim()
    .max(1000, 'Bio cannot exceed 1000 characters.')
    .optional(),
  years_of_experience: Yup.number()
    .typeError('Years of experience must be a number.')
    .min(0, 'Years of experience cannot be negative.')
    .max(60, 'Years of experience seems invalid.')
    .optional(),
  skill_ids: Yup.array().of(Yup.number()).optional(),
})

export default profileSchema

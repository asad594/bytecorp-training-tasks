import * as Yup from 'yup'

export const companyCreateSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(2, 'Company name must be at least 2 characters.')
    .required('Company name must be at least 2 characters.'),
  registration_number: Yup.string()
    .trim()
    .required('Registration number is required.'),
  description: Yup.string().optional(),
  website: Yup.string().optional(),
  location: Yup.string().optional(),
})

export default companyCreateSchema

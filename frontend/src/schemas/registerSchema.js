import * as Yup from 'yup'

export const registerSchema = Yup.object().shape({
  firstName: Yup.string().trim().required('First name is required.'),
  lastName: Yup.string().trim().required('Last name is required.'),
  email: Yup.string()
    .trim()
    .email('Please enter a valid email address.')
    .required('Email is required.'),
  password: Yup.string().required('Password is required.'),
  years_of_experience: Yup.number()
    .typeError('Years of experience must be a number.')
    .min(0, 'Years of experience cannot be negative.')
    .max(60, 'Years of experience seems invalid.')
    .optional(),
  confirmPassword: Yup.string()
    .required('Please confirm your password.')
    .oneOf([Yup.ref('password'), null], 'Passwords do not match.'),
  agreeTerms: Yup.boolean().oneOf(
    [true],
    'You must agree to the Terms of Service to create an account.'
  ),
})

export default registerSchema

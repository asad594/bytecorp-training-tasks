import * as Yup from 'yup'

export const registerSchema = Yup.object().shape({
  firstName: Yup.string().trim().required('First name is required.'),
  lastName: Yup.string().trim().required('Last name is required.'),
  email: Yup.string()
    .trim()
    .email('Please enter a valid email address.')
    .required('Email is required.'),
  password: Yup.string().required('Password is required.'),
  confirmPassword: Yup.string()
    .required('Please confirm your password.')
    .oneOf([Yup.ref('password'), null], 'Passwords do not match.'),
  agreeTerms: Yup.boolean().oneOf(
    [true],
    'You must agree to the Terms of Service to create an account.'
  ),
})

export default registerSchema

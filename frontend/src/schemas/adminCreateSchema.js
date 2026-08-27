import * as Yup from 'yup'

export const adminCreateSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .min(2, 'Name must be at least 2 characters.')
    .max(100, 'Name cannot exceed 100 characters.')
    .required('Name is required.'),
  email: Yup.string()
    .trim()
    .email('Enter a valid email address (e.g. name@example.com).')
    .required('Email is required.'),
  password: Yup.string()
    .required('Password is required.')
    .min(8, 'Password must be at least 8 characters long.')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter.')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter.')
    .matches(/[0-9]/, 'Password must contain at least one digit.')
    .matches(
      /[!@#$%^&*(),.?":{}|<>_\-+=[\];'`~/\\"]/,
      'Password must contain at least one special character (e.g. !@#$%^&*).'
    ),
})

export default adminCreateSchema

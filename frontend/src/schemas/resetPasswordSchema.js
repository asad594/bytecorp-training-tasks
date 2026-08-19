import * as Yup from 'yup'

export const resetPasswordSchema = Yup.object().shape({
  newPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters long.')
    .required('Password must be at least 8 characters long.'),
  confirmPassword: Yup.string()
    .required('Please confirm your password.')
    .oneOf([Yup.ref('newPassword'), null], 'Passwords do not match.'),
})

export default resetPasswordSchema

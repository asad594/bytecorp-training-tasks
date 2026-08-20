import * as Yup from 'yup'

export const companyJoinSchema = Yup.object().shape({
  registration_number: Yup.string()
    .trim()
    .required('Registration number is required.'),
})

export default companyJoinSchema

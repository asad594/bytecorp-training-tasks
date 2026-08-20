import * as Yup from 'yup'

export const jobPostSchema = Yup.object().shape({
  title: Yup.string()
    .trim()
    .min(5, 'Title must be at least 5 characters long.')
    .required('Title must be at least 5 characters long.'),
  description: Yup.string()
    .trim()
    .min(20, 'Description must be at least 20 characters long.')
    .required('Description must be at least 20 characters long.'),
  salary_min: Yup.mixed().optional(),
  salary_max: Yup.mixed()
    .optional()
    .test(
      'salary-max-gte-min',
      'Maximum salary cannot be less than minimum salary.',
      function (value) {
        const { salary_min } = this.parent
        if (
          value !== undefined &&
          value !== null &&
          value !== '' &&
          salary_min !== undefined &&
          salary_min !== null &&
          salary_min !== ''
        ) {
          return Number(value) >= Number(salary_min)
        }
        return true
      }
    ),
  employment_type: Yup.string().optional(),
  location: Yup.string().optional(),
  status: Yup.string().optional(),
})

export default jobPostSchema

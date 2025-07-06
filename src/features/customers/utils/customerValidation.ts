import * as yup from 'yup';
import { CustomerType } from '../types/customer.types';

const phoneRegex = /^\+?[0-9]{10,15}$/;

const baseSchema = {
  address: yup.string().required('Address is required'),
  phone: yup
    .string()
    .required('Phone is required')
    .matches(phoneRegex, 'Phone number format is invalid'),
  email: yup
    .string()
    .required('Email is required')
    .email('Invalid email format'),
  secondaryPhone: yup
    .string()
    .nullable()
    .matches(phoneRegex, 'Secondary phone number format is invalid'),
  secondaryEmail: yup
    .string()
    .nullable()
    .email('Invalid secondary email format'),
  additionalNotes: yup.string().nullable()
};

const individualDetailsSchema = yup.object().shape({
  type: yup.string().oneOf([CustomerType.INDIVIDUAL]).required(),
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  idNumber: yup
    .string()
    .required('ID number is required')
    .min(10, 'ID number must be between 10 and 20 characters')
    .max(20, 'ID number must be between 10 and 20 characters'),
  dateOfBirth: yup
    .string()
    .required('Date of birth is required'),
  ...baseSchema
});

const businessDetailsSchema = yup.object().shape({
  type: yup.string().oneOf([CustomerType.BUSINESS]).required(),
  legalName: yup.string().required('Legal name is required'),
  nuisNipt: yup
    .string()
    .required('NUIS/NIPT is required')
    .min(8, 'NUIS/NIPT must be between 8 and 15 characters')
    .max(15, 'NUIS/NIPT must be between 8 and 15 characters'),
  administratorName: yup.string().required('Administrator name is required'),
  administratorId: yup.string().required('Administrator ID is required'),
  administratorPosition: yup.string().required('Administrator position is required'),
  mainShareholders: yup.string().nullable(),
  ...baseSchema
});

// Unified schema that can handle both customer types
export const getValidationSchema = (customerType: CustomerType) => {
  return yup.object().shape({
    individualDetails: yup.lazy(() => 
      customerType === CustomerType.INDIVIDUAL 
        ? individualDetailsSchema.required('Individual details are required')
        : yup.mixed().optional()
    ),
    businessDetails: yup.lazy(() => 
      customerType === CustomerType.BUSINESS
        ? businessDetailsSchema.required('Business details are required')
        : yup.mixed().optional()
    )
  });
};
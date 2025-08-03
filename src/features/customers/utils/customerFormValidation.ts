import * as yup from 'yup';
import { CustomerType } from '../types/customer.types';

/**
 * Enhanced customer form validation schema following VehicleForm pattern
 */
export const createCustomerValidationSchema = (customerType: CustomerType) => {
  const baseContactSchema = {
    address: yup.string().required('Address is required'),
    phone: yup
      .string()
      .required('Phone is required')
      .test('valid-phone', 'Please enter a valid phone number', (value) => {
        // MuiTelInput formats phones like "+1 234 567 8901" or "+33 1 23 45 67 89"
        // Accept international format with spaces, dashes, or parentheses
        return /^\+\d{1,3}\s?\d[\d\s\-\(\)]{7,15}$/.test(value || '');
      }),
    email: yup
      .string()
      .required('Email is required')
      .email('Invalid email format'),
    secondaryPhone: yup
      .string()
      .optional()
      .test('valid-secondary-phone', 'Please enter a valid secondary phone number', (value) => {
        // Allow empty/null values for optional field
        if (!value) return true;
        // Same validation as primary phone for non-empty values
        return /^\+\d{1,3}\s?\d[\d\s\-\(\)]{7,15}$/.test(value);
      }),
    secondaryEmail: yup
      .string()
      .optional()
      .email('Invalid secondary email format'),
    additionalNotes: yup.string().optional()
  };

  const individualSchema = yup.object({
    type: yup.string().oneOf([CustomerType.INDIVIDUAL]).required(),
    firstName: yup
      .string()
      .required('First name is required')
      .min(2, 'First name must be at least 2 characters')
      .max(50, 'First name cannot exceed 50 characters'),
    lastName: yup
      .string()
      .required('Last name is required')
      .min(2, 'Last name must be at least 2 characters')
      .max(50, 'Last name cannot exceed 50 characters'),
    idNumber: yup
      .string()
      .required('ID number is required')
      .min(10, 'ID number must be between 10 and 20 characters')
      .max(20, 'ID number must be between 10 and 20 characters'),
    dateOfBirth: yup
      .string()
      .required('Date of birth is required'),
    ...baseContactSchema
  });

  const businessSchema = yup.object({
    type: yup.string().oneOf([CustomerType.BUSINESS]).required(),
    legalName: yup
      .string()
      .required('Legal name is required')
      .min(2, 'Legal name must be at least 2 characters')
      .max(100, 'Legal name cannot exceed 100 characters'),
    nuisNipt: yup
      .string()
      .required('NUIS/NIPT is required')
      .min(8, 'NUIS/NIPT must be between 8 and 15 characters')
      .max(15, 'NUIS/NIPT must be between 8 and 15 characters'),
    administratorName: yup
      .string()
      .required('Administrator name is required')
      .min(2, 'Administrator name must be at least 2 characters')
      .max(100, 'Administrator name cannot exceed 100 characters'),
    administratorId: yup
      .string()
      .required('Administrator ID is required')
      .min(10, 'Administrator ID must be between 10 and 20 characters')
      .max(20, 'Administrator ID must be between 10 and 20 characters'),
    administratorPosition: yup
      .string()
      .required('Administrator position is required')
      .min(2, 'Administrator position must be at least 2 characters')
      .max(50, 'Administrator position cannot exceed 50 characters'),
    mainShareholders: yup.string().optional(),
    ...baseContactSchema
  });

  return yup.object({
    customerType: yup.string().oneOf(Object.values(CustomerType)).required('Customer type is required'),
    individualDetails: yup.lazy(() => 
      customerType === CustomerType.INDIVIDUAL 
        ? individualSchema.required('Individual details are required')
        : yup.mixed().optional()
    ),
    businessDetails: yup.lazy(() => 
      customerType === CustomerType.BUSINESS
        ? businessSchema.required('Business details are required')
        : yup.mixed().optional()
    )
  });
};

// Step field definitions following VehicleForm pattern
export const STEP_FIELDS = {
  CUSTOMER_TYPE: ['customerType'],
  INDIVIDUAL_DETAILS: [
    'individualDetails.firstName',
    'individualDetails.lastName', 
    'individualDetails.idNumber',
    'individualDetails.dateOfBirth',
    'individualDetails.address',
    'individualDetails.phone',
    'individualDetails.email',
    'individualDetails.secondaryPhone',
    'individualDetails.secondaryEmail',
    'individualDetails.additionalNotes'
  ],
  BUSINESS_DETAILS: [
    'businessDetails.legalName',
    'businessDetails.nuisNipt',
    'businessDetails.administratorName',
    'businessDetails.administratorId',
    'businessDetails.administratorPosition',
    'businessDetails.mainShareholders',
    'businessDetails.address',
    'businessDetails.phone',
    'businessDetails.email',
    'businessDetails.secondaryPhone',
    'businessDetails.secondaryEmail',
    'businessDetails.additionalNotes'
  ]
};

// Required fields for each step
export const REQUIRED_FIELDS = {
  CUSTOMER_TYPE: ['customerType'],
  INDIVIDUAL_DETAILS: [
    'individualDetails.firstName',
    'individualDetails.lastName',
    'individualDetails.idNumber',
    'individualDetails.dateOfBirth',
    'individualDetails.address',
    'individualDetails.phone',
    'individualDetails.email'
  ],
  BUSINESS_DETAILS: [
    'businessDetails.legalName',
    'businessDetails.nuisNipt',
    'businessDetails.administratorName',
    'businessDetails.administratorId',
    'businessDetails.administratorPosition',
    'businessDetails.address',
    'businessDetails.phone',
    'businessDetails.email'
  ]
};

// Step configuration
export const STEP_CONFIG = [
  {
    label: 'Customer Type',
    description: 'Select individual or business customer',
    fields: STEP_FIELDS.CUSTOMER_TYPE,
    requiredFields: REQUIRED_FIELDS.CUSTOMER_TYPE
  },
  {
    label: 'Customer Details',
    description: 'Enter detailed customer information',
    fields: [], // Will be set dynamically based on customer type
    requiredFields: [] // Will be set dynamically based on customer type
  },
  {
    label: 'Review',
    description: 'Review and confirm customer information',
    fields: [],
    requiredFields: []
  }
] as const;

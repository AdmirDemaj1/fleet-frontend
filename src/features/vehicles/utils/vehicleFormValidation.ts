import * as yup from 'yup';
import dayjs from 'dayjs';
import { VehicleStatus, FuelType } from '../types/vehicleType';

/**
 * Enhanced vehicle form validation schema with comprehensive business rules
 */
export const createVehicleValidationSchema = () => {
  const currentYear = new Date().getFullYear();
  
  return yup.object({
    // Basic Info - License plate is now optional (can be added later when used in contract)
    licensePlate: yup
      .string()
      .nullable()
      .notRequired()
      .transform(value => value === '' ? null : value?.toUpperCase())
      .test('license-plate-format', 'License plate must be at least 3 characters', function(value) {
        if (!value) return true; // Allow empty/null
        return value.length >= 3;
      })
      .test('license-plate-max', 'License plate cannot exceed 15 characters', function(value) {
        if (!value) return true;
        return value.length <= 15;
      })
      .test('license-plate-pattern', 'License plate can only contain letters, numbers, hyphens, and spaces', function(value) {
        if (!value) return true;
        return /^[A-Z0-9\-\s]+$/i.test(value);
      }),
    
    vin: yup
      .string()
      .required('VIN is required')
      .length(17, 'VIN must be exactly 17 characters')
      .matches(/^[A-HJ-NPR-Z0-9]+$/i, 'Invalid VIN format - excludes I, O, Q')
      .transform(value => value?.toUpperCase()),
    
    make: yup
      .string()
      .required('Make is required')
      .min(2, 'Make must be at least 2 characters')
      .max(50, 'Make cannot exceed 50 characters')
      .matches(/^[a-zA-Z\s\-&]+$/, 'Make can only contain letters, spaces, hyphens, and ampersands'),
    
    model: yup
      .string()
      .required('Model is required')
      .min(1, 'Model must be at least 1 character')
      .max(50, 'Model cannot exceed 50 characters'),
    
    year: yup
      .number()
      .required('Year is required')
      .min(1900, 'Year must be at least 1900')
      .max(currentYear + 1, `Year must not exceed ${currentYear + 1}`)
      .integer('Year must be a whole number'),
    
    color: yup
      .string()
      .max(30, 'Color cannot exceed 30 characters')
      .matches(/^[a-zA-Z\s\-]+$/, 'Color can only contain letters, spaces, and hyphens')
      .nullable(),
    
    status: yup
      .string()
      .required('Status is required')
      .oneOf(Object.values(VehicleStatus), 'Invalid status selected'),

    // Details - Optional but validated when provided
    currentMileage: yup
      .number()
      .nullable()
      .min(0, 'Kilometers cannot be negative')
      .max(999999, 'Kilometers seems unrealistic (max: 999,999 km)')
      .integer('Kilometers must be a whole number'),
    
    fuelType: yup
      .string()
      .oneOf([...Object.values(FuelType), ''], 'Invalid fuel type')
      .nullable(),
    
    // COMMENTED OUT - Backend validation error
    // transmission: yup
    //   .string()
    //   .max(20, 'Transmission type cannot exceed 20 characters')
    //   .nullable(),
    
    // COMMENTED OUT - Backend validation error
    // condition: yup
    //   .string()
    //   .oneOf([...Object.values(ConditionStatus), ''], 'Invalid condition')
    //   .nullable(),
    
    legalOwner: yup
      .string()
      .max(100, 'Legal owner name cannot exceed 100 characters')
      .nullable(),
    
    isLiquidAsset: yup
      .boolean()
      .nullable(),
    
    purchaseDate: yup
      .string()
      .nullable()
      .test('valid-date', 'Invalid purchase date', function(value) {
        if (!value) return true;
        const date = dayjs(value);
        if (!date.isValid()) return false;
        if (date.isAfter(dayjs())) {
          return this.createError({ message: 'Purchase date cannot be in the future' });
        }
        if (date.isBefore(dayjs('1900-01-01'))) {
          return this.createError({ message: 'Purchase date seems too old' });
        }
        return true;
      }),
    
    // COMMENTED OUT - Backend validation error
    // purchasePrice: yup
    //   .number()
    //   .nullable()
    //   .min(0, 'Purchase price cannot be negative')
    //   .max(10000000, 'Purchase price seems unrealistic (max: $10M)'),

    // Documentation
    // COMMENTED OUT - Backend validation error
    // registrationDate: yup
    //   .string()
    //   .nullable()
    //   .test('valid-date', 'Invalid registration date', function(value) {
    //     if (!value) return true;
    //     const date = dayjs(value);
    //     return date.isValid();
    //   }),
    
    // COMMENTED OUT - Backend validation error
    // registrationExpiryDate: yup
    //   .string()
    //   .nullable()
    //   .test('valid-date', 'Invalid registration expiry date', function(value) {
    //     if (!value) return true;
    //     const date = dayjs(value);
    //     if (!date.isValid()) return false;
    //     
    //     const registrationDate = this.parent.registrationDate;
    //     if (registrationDate && date.isBefore(dayjs(registrationDate))) {
    //       return this.createError({ 
    //         message: 'Registration expiry date cannot be before registration date' 
    //       });
    //     }
    //     return true;
    //   }),
    
    // COMMENTED OUT - Backend validation error
    // insuranceProvider: yup
    //   .string()
    //   .oneOf([...Object.values(InsuranceCompany), ''], 'Invalid insurance provider')
    //   .nullable(),
    
    // COMMENTED OUT - Backend validation error
    // insurancePolicyNumber: yup
    //   .string()
    //   .max(50, 'Policy number cannot exceed 50 characters')
    //   .nullable(),
    
    // COMMENTED OUT - Backend validation error
    // insuranceExpiryDate: yup
    //   .string()
    //   .nullable()
    //   .test('valid-date', 'Invalid insurance expiry date', function(value) {
    //     if (!value) return true;
    //     const date = dayjs(value);
    //     if (!date.isValid()) return false;
    //     if (date.isBefore(dayjs())) {
    //       return this.createError({ 
    //         message: 'Insurance expiry date cannot be in the past' 
    //       });
    //     }
    //     return true;
    //   }),
    
    currentValuation: yup
      .number()
      .nullable()
      .min(0, 'Current valuation cannot be negative')
      .max(10000000, 'Current valuation seems unrealistic (max: $10M)'),
    
    marketValue: yup
      .number()
      .nullable()
      .min(0, 'Market value cannot be negative')
      .max(10000000, 'Market value seems unrealistic (max: $10M)'),
    
    depreciatedValue: yup
      .number()
      .nullable()
      .min(0, 'Depreciated value cannot be negative')
      .max(10000000, 'Depreciated value seems unrealistic (max: $10M)')
      .test('less-than-market', 'Depreciated value should not exceed market value', function(value) {
        const marketValue = this.parent.marketValue;
        if (!value || !marketValue) return true;
        return value <= marketValue;
      }),
  });
};

/**
 * Step-specific validation fields mapping
 */
export const STEP_FIELDS = {
  BASIC_INFO: ['licensePlate', 'vin', 'make', 'model', 'year', 'color', 'status'] as const,
  // Removed commented out fields: 'mileage', 'transmission', 'condition', 'purchasePrice'
  DETAILS: ['currentMileage', 'fuelType', 'legalOwner', 'isLiquidAsset', 'purchaseDate'] as const,
  // Removed commented out fields: 'registrationDate', 'registrationExpiryDate', 'insuranceProvider', 'insurancePolicyNumber', 'insuranceExpiryDate'
  DOCUMENTATION: ['currentValuation', 'marketValue', 'depreciatedValue'] as const,
  DOCUMENTS: [] as const, // Documents are handled separately
} as const;

/**
 * Required fields for each step
 * Note: licensePlate is now optional - can be added later when used in a contract
 */
export const REQUIRED_FIELDS = {
  BASIC_INFO: ['vin', 'make', 'model', 'year', 'status'] as const,
  DETAILS: [] as const,
  DOCUMENTATION: [] as const,
  DOCUMENTS: [] as const, // Documents are handled separately
} as const;

/**
 * Step configuration
 */
export const STEP_CONFIG = [
  {
    label: 'Basic Information',
    fields: STEP_FIELDS.BASIC_INFO,
    required: REQUIRED_FIELDS.BASIC_INFO,
    description: 'Enter primary vehicle identification details'
  },
  {
    label: 'Details & Specifications',
    fields: STEP_FIELDS.DETAILS,
    required: REQUIRED_FIELDS.DETAILS,
    description: 'Provide technical specifications and ownership details'
  },
  {
    label: 'Documentation & Valuation',
    fields: STEP_FIELDS.DOCUMENTATION,
    required: REQUIRED_FIELDS.DOCUMENTATION,
    description: 'Enter registration, insurance, and valuation information'
  },
  {
    label: 'Vehicle Documents',
    fields: STEP_FIELDS.DOCUMENTS,
    required: REQUIRED_FIELDS.DOCUMENTS,
    description: 'Upload required vehicle documents and certificates'
  }
] as const;

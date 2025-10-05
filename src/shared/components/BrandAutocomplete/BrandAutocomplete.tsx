import React, { useState, useMemo } from 'react';
import {
  Autocomplete,
  TextField,
  Box,
  Typography,
  Chip,
  Paper,
  InputAdornment,
  TextFieldProps,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { BrandLogo } from '../BrandLogo';
import { AVAILABLE_BRANDS, hasBrandLogo } from '../../utils/brandLogos';

interface BrandOption {
  name: string;
  hasLogo: boolean;
  displayName: string;
}

export interface BrandAutocompleteProps {
  /** Props for the underlying TextField */
  textFieldProps?: Omit<TextFieldProps, 'value' | 'onChange'>;
  /** Current value */
  value?: string;
  /** Change handler */
  onChange?: (value: string | null) => void;
  /** Error state */
  error?: boolean;
  /** Helper text */
  helperText?: string;
  /** Required field */
  required?: boolean;
  /** Additional sx styles */
  sx?: any;
}

const BrandAutocomplete: React.FC<BrandAutocompleteProps> = ({
  value = '',
  onChange,
  error = false,
  helperText,
  required = false,
  textFieldProps = {},
  sx,
  ...autocompleteProps
}) => {
  const [inputValue, setInputValue] = useState(value);

  // Sync inputValue with external value changes
  React.useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Create brand options from available logos
  const brandOptions = useMemo(() => {
    const logoBasedBrands: BrandOption[] = AVAILABLE_BRANDS.map(brand => ({
      name: brand,
      hasLogo: true,
      displayName: brand
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    }));

    // Add some additional common brands that might not have logos
    const additionalBrands = [
      'Acura', 'Infiniti', 'Lexus', 'Genesis', 'Lincoln', 'Cadillac',
      'Buick', 'GMC', 'Ram', 'Jeep', 'Dodge', 'Chrysler'
    ].filter(brand => !hasBrandLogo(brand));

    const additionalOptions: BrandOption[] = additionalBrands.map(brand => ({
      name: brand.toLowerCase().replace(/\s+/g, '-'),
      hasLogo: false,
      displayName: brand
    }));

    return [...logoBasedBrands, ...additionalOptions].sort((a, b) => 
      a.displayName.localeCompare(b.displayName)
    );
  }, []);

  // Find the current option based on value
  const currentOption = useMemo(() => {
    if (!value) return null;
    
    return brandOptions.find(option => 
      option.name === value?.toLowerCase().replace(/\s+/g, '-') ||
      option.displayName.toLowerCase() === value?.toLowerCase()
    ) || (value ? {
      name: value.toLowerCase().replace(/\s+/g, '-'),
      hasLogo: false,
      displayName: value
    } : null);
  }, [value, brandOptions]);

  return (
    <Autocomplete
      freeSolo
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      options={brandOptions}
      value={currentOption || null}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => {
        setInputValue(newInputValue);
      }}
      onChange={(_, newValue) => {
        if (typeof newValue === 'string') {
          // User typed a custom value
          onChange?.(newValue);
        } else if (newValue) {
          // User selected an option
          onChange?.(newValue.displayName);
        } else {
          // Cleared
          onChange?.(null);
        }
      }}
      onBlur={() => {
        // Handle the case where user types custom value and clicks away
        if (inputValue && inputValue.trim() && !currentOption) {
          onChange?.(inputValue.trim());
        }
      }}
      getOptionLabel={(option) => {
        if (typeof option === 'string') return option;
        return option.displayName;
      }}
      filterOptions={(options, { inputValue }) => {
        const filtered = options.filter((option: BrandOption) =>
          option.displayName.toLowerCase().includes(inputValue.toLowerCase()) ||
          option.name.toLowerCase().includes(inputValue.toLowerCase())
        );

        // If no exact match found and user has typed something, add option to create new
        const hasExactMatch = filtered.some((option: BrandOption) => 
          option.displayName.toLowerCase() === inputValue.toLowerCase()
        );

        if (inputValue !== '' && !hasExactMatch && inputValue.trim().length > 0) {
          filtered.unshift({
            name: inputValue.toLowerCase().replace(/\s+/g, '-'),
            hasLogo: false,
            displayName: inputValue.trim()
          });
        }

        return filtered;
      }}
      renderOption={(props, option: BrandOption) => (
        <Box component="li" {...props} key={option.name}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            {option.hasLogo ? (
              <BrandLogo 
                brandName={option.name} 
                size={32}
                sx={{ 
                  flexShrink: 0,
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  p: 0.5
                }}
              />
            ) : (
              <Box 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  backgroundColor: 'grey.100',
                  borderRadius: 1,
                  flexShrink: 0
                }}
              >
                <Typography variant="caption" color="text.secondary">
                  {option.displayName.charAt(0).toUpperCase()}
                </Typography>
              </Box>
            )}
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="body1" component="div" noWrap>
                {option.displayName}
              </Typography>
              {!option.hasLogo && (
                <Chip 
                  label="Custom" 
                  size="small" 
                  variant="outlined" 
                  color="primary"
                  sx={{ mt: 0.5, height: 20 }}
                />
              )}
            </Box>
          </Box>
        </Box>
      )}
      PaperComponent={(props) => (
        <Paper 
          {...props} 
          sx={{ 
            mt: 1,
            boxShadow: 3,
            borderRadius: 2,
            '& .MuiAutocomplete-option': {
              py: 1.5,
              px: 2
            }
          }} 
        />
      )}
      renderInput={(params) => {
        const selectedBrand = currentOption?.name;
        const hasSelectedLogo = selectedBrand && hasBrandLogo(selectedBrand);
        
        // When nothing is selected, show full-width text field
        if (!hasSelectedLogo) {
          return (
            <TextField
              {...params}
              {...textFieldProps}
              label="Make"
              required={required}
              error={error}
              helperText={helperText || 'Search for vehicle manufacturer or type custom name'}
              placeholder="Search brands (e.g., BMW, Toyota, Mercedes-Benz)"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2
                }
              }}
              sx={{
                width: '100%',
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                },
                ...textFieldProps.sx
              }}
            />
          );
        }
        
        // When logo is selected, show logo + text field layout
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
            {/* Logo positioned outside the input field */}
            <BrandLogo 
              brandName={selectedBrand} 
              size={80}
              sx={{ mt: -2.5 }}
            />
            
            {/* Text input field */}
            <TextField
              {...params}
              {...textFieldProps}
              label="Make"
              required={required}
              error={error}
              helperText={helperText || 'Search for vehicle manufacturer or type custom name'}
              placeholder="Search brands (e.g., BMW, Toyota, Mercedes-Benz)"
              InputProps={{
                ...params.InputProps,
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="action" />
                  </InputAdornment>
                ),
                sx: {
                  borderRadius: 2
                }
              }}
              sx={{
                flex: 1,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2
                },
                ...textFieldProps.sx
              }}
            />
          </Box>
        );
      }}
      sx={{
        '& .MuiAutocomplete-popupIndicator': {
          color: 'action.active'
        },
        '& .MuiAutocomplete-clearIndicator': {
          color: 'action.active'
        },
        ...sx
      }}
      {...autocompleteProps}
    />
  );
};

export default BrandAutocomplete;
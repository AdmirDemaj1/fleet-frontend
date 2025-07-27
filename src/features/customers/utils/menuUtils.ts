import { CustomerType } from '../types/customer.types';

export const getCustomerDisplayName = (customer: any): string => {
  if (!customer) return 'Customer';
  
  const customerData = customer?.customer || customer;
  
  if (customerData?.type === CustomerType.INDIVIDUAL) {
    const firstName = customerData?.firstName || '';
    const lastName = customerData?.lastName || '';
    const fullName = `${firstName} ${lastName}`.trim();
    return fullName || 'Customer';
  } else {
    const businessName = customerData?.legalName;
    return businessName || 'Business Customer';
  }
};

export const getCurrentTabIndex = (pathname: string, menuItems: Array<{ path: string }>): number => {
  const currentItem = menuItems.find(item => pathname.includes(item.path));
  return currentItem ? menuItems.indexOf(currentItem) : 0;
};

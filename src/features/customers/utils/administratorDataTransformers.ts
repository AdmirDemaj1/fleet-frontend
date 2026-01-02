import { CustomerType } from "../types/customer.types";

/**
 * Transforms administrator API data to form format
 */
export const transformAdministratorData = (administrator: any) => {
  const administratorData = (administrator.customer || administrator) as any;

  return {
    administratorDetails: {
      type: CustomerType.ADMINISTRATOR,
      nuisNipt: administratorData.nuisNipt || "",
      companyName: administratorData.companyName || "",
      companyEmail: administratorData.companyEmail || "",
      companyPhone: administratorData.companyPhone || "",
      administratorName: administratorData.administratorName || "",
      administratorId: administratorData.administratorId || "",
      administratorPosition: administratorData.administratorPosition || "",
      address: administratorData.address || "",
      phone: administratorData.phone || "",
      email: administratorData.email || "",
      secondaryPhone: administratorData.secondaryPhone || "",
      secondaryEmail: administratorData.secondaryEmail || "",
      additionalNotes: administratorData.additionalNotes || "",
    },
  };
};


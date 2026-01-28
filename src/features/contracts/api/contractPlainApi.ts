import { api } from "../../../shared/utils/api";

/**
 * Plain axios API for contract document uploads
 * Using the same pattern as customerApi for reliable file uploads
 */
export const contractPlainApi = {
  // Upload contract document
  uploadContractDocument: async (
    contractId: string,
    file: File,
    documentType: string,
    expiryDate: string,
    title?: string,
    customerId?: string
  ): Promise<any> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("type", documentType);
    formData.append("title", title || file.name);
    formData.append("expiryDate", expiryDate);
    formData.append("contractId", contractId);
    
    if (customerId) {
      formData.append("customerId", customerId);
    }

    console.log("📄 Uploading contract document:", {
      contractId,
      documentType,
      fileName: file.name,
      expiryDate,
      customerId,
    });

    // Log FormData contents for debugging
    console.log("📄 FormData entries:");
    for (const [key, value] of formData.entries()) {
      console.log(`  ${key}:`, value instanceof File ? `${value.name} (${value.size} bytes)` : value);
    }

    const response = await api.post(`/documents/upload`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    console.log("✅ Contract document uploaded successfully:", response.data);
    return response.data;
  },
};

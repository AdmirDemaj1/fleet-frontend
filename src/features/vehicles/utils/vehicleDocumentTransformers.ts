import { VehicleDocumentType } from "../types/vehicleType";
import { VehicleDocumentFile } from "../components/VehicleDocumentUpload/VehicleDocumentUpload";

/**
 * Maps API document type to VehicleDocumentType enum
 */
const mapApiTypeToVehicleDocumentType = (docType: string): VehicleDocumentType => {
  const normalizedType = docType?.toLowerCase();
  
  if (normalizedType === "vehicle_registration") {
    return VehicleDocumentType.VEHICLE_REGISTRATION;
  } else if (normalizedType === "vehicle_inspection") {
    return VehicleDocumentType.VEHICLE_INSPECTION;
  } else if (normalizedType === "insurance") {
    return VehicleDocumentType.INSURANCE;
  } else if (normalizedType === "tpl") {
    return VehicleDocumentType.TPL;
  } else if (normalizedType === "casco") {
    return VehicleDocumentType.CASCO;
  } else if (normalizedType === "purchase_invoice") {
    return VehicleDocumentType.PURCHASE_INVOICE;
  } else if (normalizedType === "technical_passport") {
    return VehicleDocumentType.TECHNICAL_PASSPORT;
  } else {
    return VehicleDocumentType.OTHER;
  }
};

/**
 * Determines if a document category is required
 */
const isRequiredDocument = (category: VehicleDocumentType): boolean => {
  return [
    VehicleDocumentType.VEHICLE_REGISTRATION,
    VehicleDocumentType.VEHICLE_INSPECTION,
    VehicleDocumentType.INSURANCE,
    VehicleDocumentType.TPL,
    VehicleDocumentType.CASCO,
  ].includes(category);
};

/**
 * Determines document status from API response
 */
const determineDocumentStatus = (doc: any): "pending" | "uploaded" | "verified" | "rejected" => {
  if (doc.status === "completed") {
    return "verified";
  } else if (doc.status === "pending") {
    return "pending";
  } else if (doc.status === "rejected") {
    return "rejected";
  }
  return "uploaded";
};

/**
 * Transforms API documents to VehicleDocumentFile format
 */
export const transformDocumentsToVehicleFormat = (apiDocuments: any[]): VehicleDocumentFile[] => {
  if (!apiDocuments || apiDocuments.length === 0) {
    return [];
  }

  return apiDocuments.map((doc) => {
    const category = mapApiTypeToVehicleDocumentType(doc.type);
    const status = determineDocumentStatus(doc);

    return {
      id: doc.id,
      name: doc.fileName || doc.title,
      type: doc.type || "application/pdf",
      size: 0, // Size not available from API
      documentId: doc.id,
      category,
      description: doc.title,
      expiryDate: "", // Expiry date not in Document type, would need to be fetched separately
      isRequired: isRequiredDocument(category),
      status,
      uploadedAt: doc.createdAt ? new Date(doc.createdAt) : undefined,
    };
  });
};


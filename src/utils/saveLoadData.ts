import type { AttachmentPage } from "../types/attachmentPage";
import type { ImagePlacement } from "./readMediaFile";

export type SavedFormData = {
  serviceCallId: string;
  supplier: string;
  customerName: string;
  phone: string;
  invoicePrimary: string;
  invoiceSecondary: string;
  model: string;
  vin: string;
  originalMileage: string;
  currentMileage: string;
  transmission: string;
  serialNumber: string;
  tested: string;
  programming: string;
};

export type SavedDocumentData = {
  version: string;
  formData: SavedFormData;
  perCustomer: string;
  activities: string;
  dateOfService: string | null;
  dateOfIncident: string | null;
  logoPlacement: ImagePlacement | null;
  attachmentPages: AttachmentPage[];
};

type SaveDocumentDataInput = {
  formData: SavedFormData;
  perCustomer: string;
  activities: string;
  dateOfService: Date;
  dateOfIncident: Date | null;
  logoPlacement: ImagePlacement | null;
  attachmentPages: AttachmentPage[];
  fileName?: string;
};

type SavePickerHandle = {
  createWritable: () => Promise<{
    write: (data: string) => Promise<void>;
    close: () => Promise<void>;
  }>;
};

type SavePickerGlobal = typeof globalThis & {
  showSaveFilePicker?: (options?: {
    suggestedName?: string;
    types?: Array<{
      description: string;
      accept: Record<string, string[]>;
    }>;
  }) => Promise<SavePickerHandle>;
};

export async function saveDocumentData(input: SaveDocumentDataInput): Promise<void> {
  const data: SavedDocumentData = {
    version: "1.0",
    formData: input.formData,
    perCustomer: input.perCustomer,
    activities: input.activities,
    dateOfService: input.dateOfService.toISOString(),
    dateOfIncident: input.dateOfIncident ? input.dateOfIncident.toISOString() : null,
    logoPlacement: input.logoPlacement,
    attachmentPages: input.attachmentPages,
  };

  const json = JSON.stringify(data, null, 2);
  const fallbackName = `form-data-${new Date().toISOString().split("T")[0]}`;
  const trimmedName = input.fileName?.trim();
  const finalName = trimmedName && trimmedName.length > 0 ? trimmedName : fallbackName;
  const finalFileName = finalName.toLowerCase().endsWith(".json")
    ? finalName
    : `${finalName}.json`;

  const saveGlobal = globalThis as SavePickerGlobal;

  if (saveGlobal.showSaveFilePicker) {
    try {
      const handle = await saveGlobal.showSaveFilePicker({
        suggestedName: finalFileName,
        types: [
          {
            description: "JSON Files",
            accept: {
              "application/json": [".json"],
            },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(json);
      await writable.close();
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      throw error;
    }
  }

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = finalFileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export async function loadDocumentData(file: File): Promise<SavedDocumentData> {
  try {
    const text = await file.text();
    const data = JSON.parse(text) as SavedDocumentData;
    
    // Validate the data structure
    if (!data.version || !data.formData || !data.attachmentPages) {
      throw new Error("Invalid file format");
    }
    
    return data;
  } catch (error) {
    throw new Error("Invalid JSON file: " + (error as Error).message);
  }
}

import React from "react";
import { flushSync } from "react-dom";
import {
  createAttachmentPage,
  type AttachmentPage,
} from "../types/attachmentPage";
import {
  captureLetterPageElement,
  exportLetterPagesFromDataUrls,
} from "../utils/exportLetterPage";
import type { ImagePlacement } from "../utils/readMediaFile";
import {
  saveDocumentData,
  loadDocumentData,
  type SavedFormData,
} from "../utils/saveLoadData";

const waitForPaint = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

export type InvoiceFormData = {
  formData: SavedFormData;
  perCustomer: string;
  activities: string;
  dateOfService: Date;
  dateOfIncident: Date | null;
  logoPlacement: ImagePlacement | null;
};

type DocumentContextValue = {
  isExporting: boolean;
  attachmentPages: AttachmentPage[];
  setAttachmentPages: React.Dispatch<React.SetStateAction<AttachmentPage[]>>;
  activeAttachmentPageId: string;
  setActiveAttachmentPageId: (id: string) => void;
  resetVersion: number;
  clearAllAddedInput: () => void;
  hasAttachmentContent: boolean;
  registerInvoicePrintRef: (element: HTMLDivElement | null) => void;
  registerAttachmentPrintRef: (element: HTMLDivElement | null) => void;
  downloadPdf: () => Promise<void>;
  invoiceData: InvoiceFormData;
  setInvoiceData: (data: InvoiceFormData | ((prev: InvoiceFormData) => InvoiceFormData)) => void;
  saveAllData: (fileName?: string) => Promise<void>;
  loadAllData: (file: File) => Promise<void>;
};

const DocumentContext = React.createContext<DocumentContextValue | null>(null);

export function DocumentProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const initialPage = React.useMemo(() => createAttachmentPage(), []);
  const invoicePrintRef = React.useRef<HTMLDivElement | null>(null);
  const attachmentPrintRef = React.useRef<HTMLDivElement | null>(null);

  const [attachmentPages, setAttachmentPages] = React.useState<AttachmentPage[]>(
    [initialPage],
  );
  const [activeAttachmentPageId, setActiveAttachmentPageId] =
    React.useState(initialPage.id);
  const [isExporting, setIsExporting] = React.useState(false);
  const [resetVersion, setResetVersion] = React.useState(0);

  const [invoiceData, setInvoiceData] = React.useState<InvoiceFormData>({
    formData: {
      serviceCallId: "",
      supplier: "",
      customerName: "",
      phone: "",
      invoicePrimary: "",
      invoiceSecondary: "",
      model: "",
      vin: "",
      originalMileage: "",
      currentMileage: "",
      transmission: "",
      serialNumber: "",
      tested: "",
      programming: "",
    },
    perCustomer: "",
    activities: "",
    dateOfService: new Date(),
    dateOfIncident: null,
    logoPlacement: null,
  });

  const hasAttachmentContent = attachmentPages.some(
    (page) => page.items.length > 0,
  );

  const registerInvoicePrintRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      invoicePrintRef.current = element;
    },
    [],
  );

  const registerAttachmentPrintRef = React.useCallback(
    (element: HTMLDivElement | null) => {
      attachmentPrintRef.current = element;
    },
    [],
  );

  const downloadPdf = React.useCallback(async () => {
    const previousAttachmentPageId = activeAttachmentPageId;
    const pageDataUrls: string[] = [];

    setIsExporting(true);

    try {
      await waitForPaint();

      if (invoicePrintRef.current) {
        pageDataUrls.push(
          await captureLetterPageElement(invoicePrintRef.current),
        );
      }

      const pagesWithContent = attachmentPages.filter(
        (page) => page.items.length > 0,
      );

      for (const page of pagesWithContent) {
        flushSync(() => {
          setActiveAttachmentPageId(page.id);
        });
        await waitForPaint();

        if (attachmentPrintRef.current) {
          pageDataUrls.push(
            await captureLetterPageElement(attachmentPrintRef.current),
          );
        }
      }

      flushSync(() => {
        setActiveAttachmentPageId(previousAttachmentPageId);
      });

      if (pageDataUrls.length === 0) return;

      await exportLetterPagesFromDataUrls(pageDataUrls, "service.pdf");
    } finally {
      setIsExporting(false);
    }
  }, [activeAttachmentPageId, attachmentPages]);

  const clearAllAddedInput = React.useCallback(() => {
    const nextInitialPage = createAttachmentPage();
    setAttachmentPages([nextInitialPage]);
    setActiveAttachmentPageId(nextInitialPage.id);
    setInvoiceData({
      formData: {
        serviceCallId: "",
        supplier: "",
        customerName: "",
        phone: "",
        invoicePrimary: "",
        invoiceSecondary: "",
        model: "",
        vin: "",
        originalMileage: "",
        currentMileage: "",
        transmission: "",
        serialNumber: "",
        tested: "",
        programming: "",
      },
      perCustomer: "",
      activities: "",
      dateOfService: new Date(),
      dateOfIncident: null,
      logoPlacement: null,
    });
    setResetVersion((current) => current + 1);
  }, []);

  const saveAllData = React.useCallback(async (fileName?: string) => {
    await saveDocumentData({
      formData: invoiceData.formData,
      perCustomer: invoiceData.perCustomer,
      activities: invoiceData.activities,
      dateOfService: invoiceData.dateOfService,
      dateOfIncident: invoiceData.dateOfIncident,
      logoPlacement: invoiceData.logoPlacement,
      attachmentPages,
      fileName,
    });
  }, [invoiceData, attachmentPages]);

  const loadAllData = React.useCallback(async (file: File) => {
    const data = await loadDocumentData(file);
    
    setInvoiceData({
      formData: data.formData,
      perCustomer: data.perCustomer,
      activities: data.activities,
      dateOfService: data.dateOfService ? new Date(data.dateOfService) : new Date(),
      dateOfIncident: data.dateOfIncident ? new Date(data.dateOfIncident) : null,
      logoPlacement: data.logoPlacement,
    });
    
    setAttachmentPages(data.attachmentPages);
    setActiveAttachmentPageId(data.attachmentPages[0]?.id ?? "");
    setResetVersion((current) => current + 1);
  }, []);

  const value = React.useMemo(
    () => ({
      isExporting,
      attachmentPages,
      setAttachmentPages,
      activeAttachmentPageId,
      setActiveAttachmentPageId,
      resetVersion,
      clearAllAddedInput,
      hasAttachmentContent,
      registerInvoicePrintRef,
      registerAttachmentPrintRef,
      downloadPdf,
      invoiceData,
      setInvoiceData,
      saveAllData,
      loadAllData,
    }),
    [
      isExporting,
      attachmentPages,
      activeAttachmentPageId,
      resetVersion,
      clearAllAddedInput,
      hasAttachmentContent,
      registerInvoicePrintRef,
      registerAttachmentPrintRef,
      downloadPdf,
      invoiceData,
      saveAllData,
      loadAllData,
    ],
  );

  return (
    <DocumentContext.Provider value={value}>
      {children}
    </DocumentContext.Provider>
  );
}

export function useDocument() {
  const context = React.useContext(DocumentContext);
  if (!context) {
    throw new Error("useDocument must be used within DocumentProvider");
  }
  return context;
}

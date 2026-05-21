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

const waitForPaint = () =>
  new Promise<void>((resolve) =>
    requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  );

type DocumentContextValue = {
  isExporting: boolean;
  attachmentPages: AttachmentPage[];
  setAttachmentPages: React.Dispatch<React.SetStateAction<AttachmentPage[]>>;
  activeAttachmentPageId: string;
  setActiveAttachmentPageId: (id: string) => void;
  hasAttachmentContent: boolean;
  registerInvoicePrintRef: (element: HTMLDivElement | null) => void;
  registerAttachmentPrintRef: (element: HTMLDivElement | null) => void;
  downloadPdf: () => Promise<void>;
};

const DocumentContext = React.createContext<DocumentContextValue | null>(null);

export function DocumentProvider({ children }: { children: React.ReactNode }) {
  const initialPage = React.useMemo(() => createAttachmentPage(), []);
  const invoicePrintRef = React.useRef<HTMLDivElement | null>(null);
  const attachmentPrintRef = React.useRef<HTMLDivElement | null>(null);

  const [attachmentPages, setAttachmentPages] = React.useState<AttachmentPage[]>(
    [initialPage],
  );
  const [activeAttachmentPageId, setActiveAttachmentPageId] =
    React.useState(initialPage.id);
  const [isExporting, setIsExporting] = React.useState(false);

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

  const value = React.useMemo(
    () => ({
      isExporting,
      attachmentPages,
      setAttachmentPages,
      activeAttachmentPageId,
      setActiveAttachmentPageId,
      hasAttachmentContent,
      registerInvoicePrintRef,
      registerAttachmentPrintRef,
      downloadPdf,
    }),
    [
      isExporting,
      attachmentPages,
      activeAttachmentPageId,
      hasAttachmentContent,
      registerInvoicePrintRef,
      registerAttachmentPrintRef,
      downloadPdf,
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

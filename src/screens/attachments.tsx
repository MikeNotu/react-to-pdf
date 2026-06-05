import React from "react";
import { MediaFilePickerButton } from "../components/MediaFilePickerButton";
import { PlacedImage } from "../components/PlacedImage";
import { ResponsivePage } from "../components/ResponsivePage";
import { useDocument } from "../context/DocumentContext";
import { MEDIA_FILE_ERROR } from "../constants/mediaFiles";
import { letterPageBounds } from "../constants/letterPageStyles";
import {
  createAttachmentPage,
  type AttachmentPage,
  type PlacedAttachment,
} from "../types/attachmentPage";
import {
  defaultAttachmentPlacement,
  isMediaFile,
  readMediaFile,
  type ImagePlacement,
} from "../utils/readMediaFile";

export const Attachments = () => {
  const printRef = React.useRef<HTMLDivElement | null>(null);
  const pagesRef = React.useRef<AttachmentPage[]>([]);
  const [activeItemId, setActiveItemId] = React.useState<string | null>(null);

  const {
    isExporting,
    attachmentPages: pages,
    setAttachmentPages: setPages,
    activeAttachmentPageId: activePageId,
    setActiveAttachmentPageId: setActivePageId,
    registerAttachmentPrintRef,
    downloadPdf,
    resetVersion,
  } = useDocument();

  pagesRef.current = pages;

  React.useEffect(() => {
    setActiveItemId(null);
  }, [resetVersion]);

  const activePage = pages.find((page) => page.id === activePageId) ?? pages[0];
  const items = activePage?.items ?? [];

  const setPrintRef = (element: HTMLDivElement | null) => {
    printRef.current = element;
    registerAttachmentPrintRef(element);
  };

  const updatePageItems = (
    pageId: string,
    updater: (items: PlacedAttachment[]) => PlacedAttachment[],
  ) => {
    setPages((current) =>
      current.map((page) =>
        page.id === pageId ? { ...page, items: updater(page.items) } : page,
      ),
    );
  };

  const isPdfFile = (file: File) =>
    file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");

  const handleFilesSelected = async (files: File[]) => {
    const pageId = activePageId;
    const invalid = files.find((file) => !isMediaFile(file));
    if (invalid) {
      throw new Error(MEDIA_FILE_ERROR);
    }

    const page = pagesRef.current.find((entry) => entry.id === pageId);
    if (!page) return;

    const startIndex = page.items.length;
    let nextIndex = startIndex;
    const added: PlacedAttachment[] = [];

    for (const file of files) {
      const sources = isPdfFile(file)
        ? await (await import("../utils/renderPdfPage")).renderPdfPagesToDataUrls(
            file,
          )
        : [await readMediaFile(file)];

      for (const src of sources) {
        const placement = await defaultAttachmentPlacement(
          src,
          letterPageBounds,
          nextIndex,
        );
        added.push({ ...placement, id: crypto.randomUUID() });
        nextIndex += 1;
      }
    }

    if (added.length === 0) return;

    setPages((current) =>
      current.map((entry) =>
        entry.id === pageId
          ? { ...entry, items: [...entry.items, ...added] }
          : entry,
      ),
    );
    setActiveItemId(added[added.length - 1]?.id ?? null);
  };

  const updateItem = (id: string, placement: ImagePlacement) => {
    if (!activePage) return;
    updatePageItems(activePage.id, (current) =>
      current.map((item) => (item.id === id ? { ...item, ...placement } : item)),
    );
  };

  const removeItem = (id: string) => {
    if (!activePage) return;
    updatePageItems(activePage.id, (current) =>
      current.filter((item) => item.id !== id),
    );
    setActiveItemId((current) => (current === id ? null : current));
  };

  const handleAddPage = () => {
    const page = createAttachmentPage();
    setPages((current) => [...current, page]);
    setActivePageId(page.id);
    setActiveItemId(null);
  };

  const handleRemovePage = () => {
    if (pages.length <= 1 || !activePage) return;

    const remaining = pages.filter((page) => page.id !== activePage.id);
    setPages(remaining);
    setActivePageId(remaining[0]?.id ?? "");
    setActiveItemId(null);
  };

  const handleSelectPage = (pageId: string) => {
    setActivePageId(pageId);
    setActiveItemId(null);
  };

  const activePageIndex = pages.findIndex((page) => page.id === activePageId);

  return (
    <div className="flex-1 bg-gray-100 px-2 sm:px-4 pb-4 flex flex-col items-center overflow-hidden">
      <div className="bg-white shadow-lg rounded-lg p-2 sm:p-4 w-full max-w-6xl flex flex-col items-center overflow-hidden">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 self-start">
          Attachments
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 mb-4 self-start">
          Create multiple pages, add JPG/PNG/PDF files to each, then drag,
          resize, or delete them. Download PDF includes the Service Form first,
          then every attachment page that has files.
        </p>

        <div className="w-full flex flex-wrap items-center gap-2 mb-4 self-start overflow-x-auto">
          {pages.map((page, index) => (
            <button
              key={page.id}
              type="button"
              onClick={() => handleSelectPage(page.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition duration-300 ${
                page.id === activePageId
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
              }`}
            >
              Page {index + 1}
              {page.items.length > 0 ? ` (${page.items.length})` : ""}
            </button>
          ))}
          <button
            type="button"
            onClick={handleAddPage}
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition duration-300"
          >
            Add Page
          </button>
          {pages.length > 1 ? (
            <button
              type="button"
              onClick={handleRemovePage}
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition duration-300"
            >
              Remove Page
            </button>
          ) : null}
        </div>

        <div className="w-full overflow-auto flex justify-center max-h-[calc(100vh-16rem)] sm:max-h-[calc(100vh-18rem)]">
          <ResponsivePage
            pageRef={setPrintRef}
            isExporting={isExporting}
            className="bg-white border border-gray-200"
          >
            {items.map((item, index) => (
              <PlacedImage
                key={item.id}
                placement={item}
                onPlacementChange={(placement) => updateItem(item.id, placement)}
                onDelete={() => removeItem(item.id)}
                onSelect={() => setActiveItemId(item.id)}
                isExporting={isExporting}
                bounds={letterPageBounds}
                alt={`Page ${activePageIndex + 1} attachment ${index + 1}`}
                zIndex={item.id === activeItemId ? 30 : 20 + index}
              />
            ))}
          </ResponsivePage>
        </div>

        <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-3 w-full">
          <MediaFilePickerButton
            label="Add Files"
            multiple
            onFilesSelected={handleFilesSelected}
            className="flex items-center bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300 disabled:cursor-not-allowed disabled:opacity-60 w-full sm:w-auto justify-center"
          />
          <button
            type="button"
            onClick={downloadPdf}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 w-full sm:w-auto justify-center"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { HashRouter, Route, Routes, useLocation } from "react-router-dom";
import { AppNav } from "./components/AppNav";
import { DocumentProvider, useDocument } from "./context/DocumentContext";
import { Attachments } from "./screens/attachments";
import { Invoice } from "./screens/invoice";

function AppRoutes() {
  const { isExporting } = useDocument();
  const location = useLocation();
  const isAttachments = location.pathname === "/attachments";

  if (isExporting) {
    return (
      <>
        <div
          className="fixed left-[-20000px] top-0 w-[816px] overflow-hidden"
          aria-hidden
        >
          <Invoice />
          <Attachments />
        </div>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <p className="rounded-lg bg-white px-6 py-4 text-lg font-medium text-gray-800 shadow-lg">
            Generating PDF…
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <div className={isAttachments ? "hidden" : "flex flex-col flex-1 min-h-0"}>
        <Invoice />
      </div>
      <div
        className={
          isAttachments ? "flex flex-col flex-1 min-h-0" : "hidden"
        }
      >
        <Attachments />
      </div>
    </>
  );
}

function AppShell() {
  const { isExporting, clearAllAddedInput, saveAllData, loadAllData } = useDocument();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);
  const [loadError, setLoadError] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handleConfirmDelete = () => {
    clearAllAddedInput();
    setIsDeleteModalOpen(false);
  };

  const handleSaveData = async () => {
    try {
      await saveAllData();
    } catch (error) {
      console.error("Failed to save data:", error);
      alert("Failed to save data. Please try again.");
    }
  };

  const handleLoadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoadError(null);
      await loadAllData(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load data";
      setLoadError(message);
    }

    // Reset input so the same file can be loaded again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <AppNav
        rightContent={
          <div className="flex w-full sm:w-auto gap-2">
            <button
              type="button"
              onClick={handleSaveData}
              disabled={isExporting}
              className="flex-1 sm:flex-none px-3 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Save Data
            </button>
            <button
              type="button"
              onClick={handleLoadClick}
              disabled={isExporting}
              className="flex-1 sm:flex-none px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Load Data
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleFileSelected}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(true)}
              disabled={isExporting}
              className="flex-1 sm:flex-none px-3 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Delete All
            </button>
          </div>
        }
      />
      <Routes>
        <Route path="*" element={<AppRoutes />} />
      </Routes>

      {isDeleteModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-900">
              Delete all added input
            </h2>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-md bg-red-600 text-white hover:bg-red-700 transition duration-300"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {loadError ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-5 shadow-xl">
            <h2 className="text-lg font-semibold text-red-600">
              Error Loading Data
            </h2>
            <p className="mt-2 text-sm text-gray-700">{loadError}</p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setLoadError(null)}
                className="px-4 py-2 rounded-md bg-gray-200 text-gray-800 hover:bg-gray-300 transition duration-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function App() {
  return (
    <HashRouter>
      <DocumentProvider>
        <AppShell />
      </DocumentProvider>
    </HashRouter>
  );
}

export default App;

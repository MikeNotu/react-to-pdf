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

function App() {
  return (
    <HashRouter>
      <DocumentProvider>
        <div className="min-h-screen bg-gray-100 flex flex-col">
          <AppNav />
          <Routes>
            <Route path="*" element={<AppRoutes />} />
          </Routes>
        </div>
      </DocumentProvider>
    </HashRouter>
  );
}

export default App;

import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React from "react";

export const Invoice = () => {
  const printRef = React.useRef<HTMLDivElement | null>(null);

  const [name, setName] = React.useState("");
  const [multiline, setMultiline] = React.useState("");
  const [isExporting, setIsExporting] = React.useState(false);

  const MAX_LINES = 500;

  const normalizeNewlines = (value: string) => value.replace(/\r\n/g, "\n");

  const clampToMaxLines = (value: string) => {
    const normalized = normalizeNewlines(value);
    const lines = normalized.split("\n");
    if (lines.length <= MAX_LINES) return normalized;
    return lines.slice(0, MAX_LINES).join("\n");
  };

  const handleDownloadPdf = async () => {
    const element = printRef.current;
    if (!element) {
      return;
    }

    setIsExporting(true);

    try {
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );

      const canvas = await html2canvas(element, {
        scale: 2,
      });
      const data = canvas.toDataURL("image/png");

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "letter",
      });

      const imgProperties = pdf.getImageProperties(data);
      const pdfWidth = pdf.internal.pageSize.getWidth();

      const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;

      pdf.addImage(data, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save("examplepdf.pdf");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 flex flex-col items-center">
      <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-6xl">
        <div ref={printRef} className="p-8 bg-white border border-gray-200">
          <form className="flex flex-col">
            <div
              className="mb-4 flex flex-row"
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <p
                className="h-12 inline-block align-middle"
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginRight: "1rem",
                  marginTop: "0.5rem",
                  minWidth: "5.25rem",
                }}
              >
                Name:
              </p>
              <input
                type="text"
                name="name"
                placeholder="Input value here"
                maxLength={80}
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{
                  fontSize: "20px",
                  display: "flex",
                  height: "20px",
                  flex: 1,
                  width: "100%",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div
              className="mb-4 flex flex-row"
              style={{
                display: "flex",
                alignItems: "flex-start",
              }}
            >
              <p
                className="inline-block align-middle"
                style={{
                  fontSize: "24px",
                  fontWeight: "bold",
                  marginRight: "1rem",
                  marginTop: "0.5rem",
                  minWidth: "5.25rem",
                }}
              >
                Lines:
              </p>

              {/* Editable input (hidden during export so PDF captures full content) */}
              <div style={{ flex: 1, width: "100%", height: "300px" }}>
                {!isExporting ? (
                  <textarea
                    name="multiline"
                    placeholder="Up to 500 lines…"
                    value={multiline}
                    maxLength={500}
                    onChange={(e) =>
                      setMultiline(clampToMaxLines(e.target.value))
                    }
                    rows={10}
                    style={{
                      fontSize: "16px",
                      width: "100%",
                      resize: "none",
                      height: "100%",
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      boxSizing: "border-box",
                    }}
                  />
                ) : null}

                {/* PDF-rendered view (shown during export; preserves newlines) */}
                {isExporting ? (
                  <div
                    className="pdf-content"
                    style={{
                      fontSize: "16px",
                      width: "100%",
                      padding: "0.5rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "0.375rem",
                      boxSizing: "border-box",
                      whiteSpace: "pre-wrap",
                      overflowWrap: "anywhere",
                      minHeight: "2.5rem",
                    }}
                  >
                    {multiline}
                  </div>
                ) : null}
              </div>
            </div>
          </form>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={handleDownloadPdf}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

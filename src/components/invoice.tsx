import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const Invoice = () => {
  const printRef = React.useRef<HTMLDivElement | null>(null);
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const downloadButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const [formData, setFormData] = React.useState({
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
    tested: "",
    programming: "",
  });
  const [multiline, setMultiline] = React.useState("");
  const [isExporting, setIsExporting] = React.useState(false);

  const [dateOfService, setDateOfService] = React.useState<Date>(new Date());
  const [dateOfIncident, setDateOfIncident] = React.useState<Date | null>(null);

  const MAX_LINES = 500;

  const normalizeNewlines = (value: string) => value.replace(/\r\n/g, "\n");

  const clampToMaxLines = (value: string) => {
    const normalized = normalizeNewlines(value);
    const lines = normalized.split("\n");
    if (lines.length <= MAX_LINES) return normalized;
    return lines.slice(0, MAX_LINES).join("\n");
  };

  const updateField =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((current) => ({
        ...current,
        [field]: e.target.value,
      }));
    };

  const savePdfWithPicker = async (blob: Blob, filename: string) => {
    const windowWithPicker = window as typeof window & {
      showSaveFilePicker?: (options: {
        suggestedName?: string;
        types?: Array<{
          description: string;
          accept: Record<string, string[]>;
        }>;
      }) => Promise<{
        createWritable: () => Promise<{
          write: (data: Blob) => Promise<void>;
          close: () => Promise<void>;
        }>;
      }>;
    };

    if (!windowWithPicker.showSaveFilePicker) {
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      return;
    }

    try {
      const handle = await windowWithPicker.showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: "PDF files",
            accept: { "application/pdf": [".pdf"] },
          },
        ],
      });
      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }
      throw error;
    }
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
      const pdfBlob = pdf.output("blob");
      await savePdfWithPicker(pdfBlob, "service.pdf");
    } finally {
      setIsExporting(false);
    }
  };

  const handleInputEnter = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== "Enter" || e.shiftKey) {
      return;
    }

    if (!(e.target instanceof HTMLInputElement)) {
      return;
    }

    const form = formRef.current;
    if (!form) {
      return;
    }

    const focusableFields = Array.from(
      form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
        "input, textarea",
      ),
    ).filter(
      (field) =>
        !field.disabled &&
        (field instanceof HTMLTextAreaElement || field.type !== "hidden") &&
        field.offsetParent,
    );

    const currentIndex = focusableFields.indexOf(e.target);
    if (currentIndex === -1) {
      return;
    }

    e.preventDefault();

    const nextField = focusableFields[currentIndex + 1];
    if (nextField) {
      nextField.focus();
      return;
    }

    downloadButtonRef.current?.focus();
  };

  return (
    <div className="h-screen bg-gray-100 p-4 flex flex-col items-center overflow-hidden">
      <div className="bg-white shadow-lg rounded-lg p-4 w-full max-w-6xl flex flex-col items-center overflow-hidden">
        <div
          ref={printRef}
          className="bg-white border border-gray-200"
          style={{
            height: "calc(100vh - 140px)",
            aspectRatio: "22 / 28",
            maxWidth: "100%",
            width: "auto",
            padding: "10px",
            boxSizing: "border-box",
            overflowY: "hidden",
            overflowX: "hidden",
          }}
        >
          <form
            ref={formRef}
            onKeyDown={handleInputEnter}
            className="flex flex-col"
            style={{
              transform: "scale(0.7)",
              transformOrigin: "top left",
              width: "142.857%",
            }}
          >
            <div
              className="mb-2 flex flex-row"
              style={{
                display: "flex",
                alignItems: "baseline",
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
                Service Call ID:
              </p>
              <input
                type="text"
                name="Service Call ID"
                placeholder="----------"
                maxLength={70}
                required
                value={formData.serviceCallId}
                onChange={updateField("serviceCallId")}
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
              className="mb-2 flex flex-row"
              style={{
                display: "flex",
                alignItems: "baseline",
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
                Service Call Date:
              </p>
              <div style={{ flex: 1, width: "100%" }}>
                <DatePicker
                  selected={dateOfService}
                  onChange={(date: Date | null) =>
                    date && setDateOfService(date)
                  }
                  dateFormat="MM/dd/yy"
                  required
                  wrapperClassName="w-full"
                  customInput={
                    <input
                      name="dateOfService"
                      className="w-full"
                      style={{
                        fontSize: "20px",
                        display: "flex",
                        height: "20px",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    />
                  }
                />
              </div>
            </div>
            <div
              className="mb-2 flex flex-row"
              style={{
                display: "flex",
                alignItems: "baseline",
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
                Supplier:
              </p>
              <input
                type="text"
                name="Supplier"
                placeholder="----------"
                maxLength={70}
                required
                value={formData.supplier}
                onChange={updateField("supplier")}
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
              className="mb-2 flex flex-row"
              style={{
                display: "flex",
                alignItems: "baseline",
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
                Repair Facility:
              </p>
              <input
                type="text"
                name="Repair Facility"
                placeholder="----------"
                maxLength={70}
                required
                value={formData.customerName}
                onChange={updateField("customerName")}
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
              className="mb-2 flex flex-row"
              style={{
                display: "flex",
                alignItems: "baseline",
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
                Phone:
              </p>
              <input
                type="text"
                name="Phone"
                placeholder="----------"
                maxLength={70}
                required
                value={formData.phone}
                onChange={updateField("phone")}
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
              className="mb-2 flex flex-row"
              style={{
                display: "flex",
                alignItems: "baseline",
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
                Email:
              </p>
              <input
                type="text"
                name="Email"
                placeholder="----------"
                maxLength={70}
                required
                value={formData.invoicePrimary}
                onChange={updateField("invoicePrimary")}
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
              className="mb-2 flex flex-row"
              style={{
                display: "flex",
                alignItems: "baseline",
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
                Invoice:
              </p>
              <input
                type="text"
                name="Invoice"
                placeholder="----------"
                maxLength={70}
                required
                value={formData.invoiceSecondary}
                onChange={updateField("invoiceSecondary")}
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
              className="mb-2 flex flex-row"
              style={{
                display: "flex",
                alignItems: "baseline",
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
                Invoice Date:
              </p>
              <div style={{ flex: 1, width: "100%" }}>
                <DatePicker
                  selected={dateOfIncident}
                  onChange={(date: Date | null) => setDateOfIncident(date)}
                  dateFormat="MM/dd/yy"
                  required
                  placeholderText="MM/DD/YY"
                  wrapperClassName="w-full"
                  customInput={
                    <input
                      name="dateOfIncident"
                      className="w-full"
                      style={{
                        fontSize: "20px",
                        display: "flex",
                        height: "20px",
                        width: "100%",
                        boxSizing: "border-box",
                      }}
                    />
                  }
                />
              </div>
            </div>
            <div
              className="mb-2 flex flex-row"
              style={{
                display: "flex",
                alignItems: "baseline",
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
                Model:
              </p>
              <input
                type="text"
                name="Model"
                placeholder="----------"
                maxLength={70}
                required
                value={formData.model}
                onChange={updateField("model")}
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
              className="mb-2 flex flex-row"
              style={{
                display: "flex",
                alignItems: "baseline",
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
                VIN:
              </p>
              <input
                type="text"
                name="VIN"
                placeholder="----------"
                maxLength={70}
                required
                value={formData.vin}
                onChange={updateField("vin")}
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
              className="mb-2 flex flex-row"
              style={{
                display: "flex",
                alignItems: "baseline",
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
                Original Mileage:
              </p>
              <input
                type="text"
                name="Original Mileage"
                placeholder="----------"
                maxLength={70}
                required
                value={formData.originalMileage}
                onChange={updateField("originalMileage")}
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
              className="mb-2 flex flex-row"
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
                Current Mileage:
              </p>
              <input
                type="text"
                name="Current Mileage"
                placeholder="----------"
                maxLength={70}
                required
                value={formData.currentMileage}
                onChange={updateField("currentMileage")}
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
              className="mb-2 flex flex-row"
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
                Transmission:
              </p>
              <input
                type="text"
                name="Transmission"
                placeholder="----------"
                maxLength={70}
                required
                value={formData.transmission}
                onChange={updateField("transmission")}
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
              className="mb-2 flex flex-row"
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
                Tested:
              </p>
              <input
                type="text"
                name="Tested"
                placeholder="----------"
                maxLength={70}
                required
                value={formData.tested}
                onChange={updateField("tested")}
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
              className="mb-2 flex flex-row"
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
                Programming:
              </p>
              <input
                type="text"
                name="Programming"
                placeholder="----------"
                maxLength={70}
                required
                value={formData.programming}
                onChange={updateField("programming")}
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
              className="mb-2 flex flex-row"
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
                PER CUSTOMER:
              </p>

              {/* Editable input (hidden during export so PDF captures full content) */}
              <div style={{ flex: 1, width: "100%", height: "180px" }}>
                {!isExporting ? (
                  <textarea
                    name="multiline"
                    placeholder="Up to 500 lines…"
                    value={multiline}
                    maxLength={500}
                    onChange={(e) =>
                      setMultiline(clampToMaxLines(e.target.value))
                    }
                    rows={8}
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
            ref={downloadButtonRef}
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

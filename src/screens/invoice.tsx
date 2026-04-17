import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import React from "react";
import { LabeledDatePickerRow } from "../components/LabeledDatePickerRow";
import { LabeledTextInputRow } from "../components/LabeledTextInputRow";
import { PerCustomerField } from "../components/PerCustomerField";

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

  const normalizeNewlines = (value: string) => value.split("\r\n").join("\n");

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
    const windowWithPicker = globalThis as typeof globalThis & {
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

  React.useEffect(() => {
    const form = formRef.current;
    if (!form) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.shiftKey) return;

      const target = e.target;
      if (
        !(
          target instanceof HTMLInputElement ||
          target instanceof HTMLTextAreaElement
        )
      ) {
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

      const currentIndex = focusableFields.indexOf(target);
      if (currentIndex === -1) return;

      e.preventDefault();

      const nextField = focusableFields[currentIndex + 1];
      if (nextField) {
        nextField.focus();
        return;
      }

      downloadButtonRef.current?.focus();
    };

    form.addEventListener("keydown", handleKeyDown);
    return () => form.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="h-screen bg-gray-100 p-4 flex flex-col items-center overflow-hidden">
      <div className="bg-white shadow-lg rounded-lg p-4 w-full max-w-6xl flex flex-col items-center overflow-hidden">
        <div
          ref={printRef}
          className="bg-white border border-gray-200"
          style={printRefStyle}
        >
          <form ref={formRef} className="flex flex-col" style={formScaleStyle}>
            <LabeledTextInputRow
              label="Service Call ID"
              name="Service Call ID"
              value={formData.serviceCallId}
              onChange={updateField("serviceCallId")}
              placeholder="----------"
              maxLength={70}
            />
            <LabeledDatePickerRow
              label="Service Call Date"
              name="dateOfService"
              selected={dateOfService}
              onChange={(date) => date && setDateOfService(date)}
              dateFormat="MM/dd/yy"
            />
            <LabeledTextInputRow
              label="Supplier"
              name="Supplier"
              value={formData.supplier}
              onChange={updateField("supplier")}
              placeholder="----------"
              maxLength={70}
            />
            <LabeledTextInputRow
              label="Repair Facility"
              name="Repair Facility"
              value={formData.customerName}
              onChange={updateField("customerName")}
              placeholder="----------"
              maxLength={70}
            />
            <LabeledTextInputRow
              label="Phone"
              name="Phone"
              value={formData.phone}
              onChange={updateField("phone")}
              placeholder="----------"
              maxLength={70}
            />
            <LabeledTextInputRow
              label="Email"
              name="Email"
              value={formData.invoicePrimary}
              onChange={updateField("invoicePrimary")}
              placeholder="----------"
              maxLength={70}
            />
            <LabeledTextInputRow
              label="Invoice"
              name="Invoice"
              value={formData.invoiceSecondary}
              onChange={updateField("invoiceSecondary")}
              placeholder="----------"
              maxLength={70}
            />
            <LabeledDatePickerRow
              label="Invoice Date"
              name="dateOfIncident"
              selected={dateOfIncident}
              onChange={(date) => setDateOfIncident(date)}
              dateFormat="MM/dd/yy"
              placeholderText="MM/DD/YY"
            />
            <LabeledTextInputRow
              label="Model"
              name="Model"
              value={formData.model}
              onChange={updateField("model")}
              placeholder="----------"
              maxLength={70}
            />
            <LabeledTextInputRow
              label="VIN"
              name="VIN"
              value={formData.vin}
              onChange={updateField("vin")}
              placeholder="----------"
              maxLength={70}
            />
            <LabeledTextInputRow
              label="Original Mileage"
              name="Original Mileage"
              value={formData.originalMileage}
              onChange={updateField("originalMileage")}
              placeholder="----------"
              maxLength={70}
            />
            <LabeledTextInputRow
              label="Current Mileage"
              name="Current Mileage"
              value={formData.currentMileage}
              onChange={updateField("currentMileage")}
              placeholder="----------"
              maxLength={70}
              alignItems="center"
            />
            <LabeledTextInputRow
              label="Transmission"
              name="Transmission"
              value={formData.transmission}
              onChange={updateField("transmission")}
              placeholder="----------"
              maxLength={70}
              alignItems="center"
            />
            <LabeledTextInputRow
              label="Tested"
              name="Tested"
              value={formData.tested}
              onChange={updateField("tested")}
              placeholder="----------"
              maxLength={70}
              alignItems="center"
            />
            <LabeledTextInputRow
              label="Programming"
              name="Programming"
              value={formData.programming}
              onChange={updateField("programming")}
              placeholder="----------"
              maxLength={70}
              alignItems="center"
            />
            <PerCustomerField
              isExporting={isExporting}
              multiline={multiline}
              onChangeMultiline={setMultiline}
              clampToMaxLines={clampToMaxLines}
            />
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

const printRefStyle: React.CSSProperties = {
  height: "calc(100vh - 140px)",
  aspectRatio: "22 / 28",
  maxWidth: "100%",
  width: "auto",
  padding: "10px",
  boxSizing: "border-box",
  overflowY: "hidden",
  overflowX: "hidden",
};

const formScaleStyle: React.CSSProperties = {
  transform: "scale(0.7)",
  transformOrigin: "top left",
  width: "142.857%",
};

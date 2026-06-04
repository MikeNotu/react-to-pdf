import React from "react";
import { MediaFilePickerButton } from "../components/MediaFilePickerButton";
import { PlacedImage } from "../components/PlacedImage";
import { LabeledDatePickerRow } from "../components/LabeledDatePickerRow";
import { LabeledTextInputRow } from "../components/LabeledTextInputRow";
import { PerCustomerField } from "../components/PerCustomerField";
import { useDocument } from "../context/DocumentContext";
import { letterPageBounds, letterPageStyle } from "../constants/letterPageStyles";
import { MEDIA_FILE_ERROR } from "../constants/mediaFiles";
import {
  defaultLogoPlacement,
  isMediaFile,
  readMediaFile,
  type ImagePlacement,
} from "../utils/readMediaFile";

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
    serialNumber: "",
    tested: "",
    programming: "",
  });
  const [perCustomer, setPerCustomer] = React.useState("");
  const [activities, setActivities] = React.useState("");
  const [logoPlacement, setLogoPlacement] = React.useState<ImagePlacement | null>(
    null,
  );

  const { isExporting, registerInvoicePrintRef, downloadPdf } = useDocument();

  const [dateOfService, setDateOfService] = React.useState<Date>(new Date());
  const [dateOfIncident, setDateOfIncident] = React.useState<Date | null>(null);

  const normalizeNewlines = (value: string) => value.split("\r\n").join("\n");

  const clampToMaxLength = (value: string, maxLength: number) => {
    const normalized = normalizeNewlines(value);
    if (normalized.length <= maxLength) return normalized;
    return normalized.slice(0, maxLength);
  };

  const updateField =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((current) => ({
        ...current,
        [field]: e.target.value,
      }));
    };

  const handleLogoFilesSelected = async (files: File[]) => {
    const file = files[0];
    if (!file) return;

    if (!isMediaFile(file)) {
      throw new Error(MEDIA_FILE_ERROR);
    }

    const src = await readMediaFile(file);
    const placement = await defaultLogoPlacement(src, letterPageBounds);
    setLogoPlacement(placement);
  };

  const handleRemoveLogo = () => {
    setLogoPlacement(null);
  };

  const setPrintRef = (element: HTMLDivElement | null) => {
    printRef.current = element;
    registerInvoicePrintRef(element);
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
    <div className="flex-1 bg-gray-100 px-4 pb-4 flex flex-col items-center overflow-hidden">
      <div className="bg-white shadow-lg rounded-lg p-4 w-full max-w-6xl flex flex-col items-center overflow-hidden">
        <div className="w-full overflow-auto flex justify-center max-h-[calc(100vh-12rem)]">
          <div
            ref={setPrintRef}
            className="bg-white border border-gray-200 shrink-0"
            style={letterPageStyle}
          >
            {logoPlacement ? (
              <PlacedImage
                placement={logoPlacement}
                onPlacementChange={setLogoPlacement}
                isExporting={isExporting}
                bounds={letterPageBounds}
                alt="Company logo"
              />
            ) : null}
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
              label="Serial Number"
              name="Serial Number"
              value={formData.serialNumber}
              onChange={updateField("serialNumber")}
              placeholder="----------"
              maxLength={20}
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
              label="PER CUSTOMER"
              name="perCustomer"
              isExporting={isExporting}
              value={perCustomer}
              maxLength={500}
              rows={3}
              height={92}
              onChange={setPerCustomer}
              clampValue={clampToMaxLength}
            />
            <PerCustomerField
              label="ACTIVITIES"
              name="activities"
              isExporting={isExporting}
              value={activities}
              maxLength={600}
              rows={3}
              height={92}
              onChange={setActivities}
              clampValue={clampToMaxLength}
            />
          </form>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <MediaFilePickerButton
            label={logoPlacement ? "Change Logo" : "Add Logo"}
            onFilesSelected={handleLogoFilesSelected}
          />
          {logoPlacement ? (
            <button
              type="button"
              onClick={handleRemoveLogo}
              className="flex items-center bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition duration-300"
            >
              Remove Logo
            </button>
          ) : null}
          <button
            ref={downloadButtonRef}
            type="button"
            onClick={downloadPdf}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300"
          >
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
};

const formScaleStyle: React.CSSProperties = {
  transform: "scale(0.68)",
  transformOrigin: "top left",
  width: "147.059%",
};

import React from "react";
import { PlacedImage } from "../components/PlacedImage";
import { LabeledDatePickerRow } from "../components/LabeledDatePickerRow";
import { LabeledTextInputRow } from "../components/LabeledTextInputRow";
import { PerCustomerField } from "../components/PerCustomerField";
import { ResponsivePage } from "../components/ResponsivePage";
import { useDocument } from "../context/DocumentContext";
import { letterPageBounds } from "../constants/letterPageStyles";
import carLogo from "../assets/CarLogo.jpg";
import {
  defaultLogoPlacement,
  type ImagePlacement,
} from "../utils/readMediaFile";

export const Invoice = () => {
  const printRef = React.useRef<HTMLDivElement | null>(null);
  const formRef = React.useRef<HTMLFormElement | null>(null);
  const downloadButtonRef = React.useRef<HTMLButtonElement | null>(null);

  const {
    isExporting,
    registerInvoicePrintRef,
    downloadPdf,
    invoiceData,
    setInvoiceData,
  } = useDocument();

  const { formData, perCustomer, activities, dateOfService, dateOfIncident, logoPlacement } = invoiceData;

  const normalizeNewlines = (value: string) => value.split("\r\n").join("\n");

  const clampToMaxLength = (value: string, maxLength: number) => {
    const normalized = normalizeNewlines(value);
    if (normalized.length <= maxLength) return normalized;
    return normalized.slice(0, maxLength);
  };

  const updateField =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInvoiceData((current) => ({
        ...current,
        formData: {
          ...current.formData,
          [field]: e.target.value,
        },
      }));
    };

  const setPerCustomer = (value: string) => {
    setInvoiceData((current) => ({
      ...current,
      perCustomer: value,
    }));
  };

  const setActivities = (value: string) => {
    setInvoiceData((current) => ({
      ...current,
      activities: value,
    }));
  };

  const setDateOfService = (date: Date) => {
    setInvoiceData((current) => ({
      ...current,
      dateOfService: date,
    }));
  };

  const setDateOfIncident = (date: Date | null) => {
    setInvoiceData((current) => ({
      ...current,
      dateOfIncident: date,
    }));
  };

  const setLogoPlacement = (placement: ImagePlacement | null) => {
    setInvoiceData((current) => ({
      ...current,
      logoPlacement: placement,
    }));
  };


  const setPrintRef = (element: HTMLDivElement | null) => {
    printRef.current = element;
    registerInvoicePrintRef(element);
  };

  React.useEffect(() => {
    let mounted = true;
    const setDefaultLogo = async () => {
      try {
        const placement = await defaultLogoPlacement(carLogo, letterPageBounds);
        if (mounted) setLogoPlacement(placement);
      } catch {
        if (!mounted) return;
        setLogoPlacement({
          src: carLogo,
          x: letterPageBounds.width - 136,
          y: 16,
          width: 120,
          height: 80,
        });
      }
    };
    void setDefaultLogo();
    return () => {
      mounted = false;
    };
  }, []);

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
    <div className="flex-1 bg-gray-100 px-2 sm:px-4 pb-4 flex flex-col items-center overflow-hidden">
      <div className="bg-white shadow-lg rounded-lg p-2 sm:p-4 w-full max-w-6xl flex flex-col items-center overflow-hidden">
        <div className="w-full overflow-auto flex justify-center max-h-[calc(100vh-10rem)] sm:max-h-[calc(100vh-12rem)]">
          <ResponsivePage
            pageRef={setPrintRef}
            isExporting={isExporting}
            className="bg-white border border-gray-200"
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
            <form
              ref={formRef}
              className="flex flex-col"
              style={formScaleStyle}
            >
              <LabeledTextInputRow
                label="Service Call ID"
                name="Service Call ID"
                value={formData.serviceCallId}
                onChange={updateField("serviceCallId")}
                placeholder="----------"
                maxLength={70}
                isExporting={isExporting}
              />
              <LabeledDatePickerRow
                label="Service Call Date"
                name="dateOfService"
                selected={dateOfService}
                onChange={(date) => date && setDateOfService(date)}
                dateFormat="MM/dd/yy"
                isExporting={isExporting}
              />
              <LabeledTextInputRow
                label="Supplier"
                name="Supplier"
                value={formData.supplier}
                onChange={updateField("supplier")}
                placeholder="----------"
                maxLength={70}
                isExporting={isExporting}
              />
              <LabeledTextInputRow
                label="Repair Facility"
                name="Repair Facility"
                value={formData.customerName}
                onChange={updateField("customerName")}
                placeholder="----------"
                maxLength={70}
                isExporting={isExporting}
              />
              <LabeledTextInputRow
                label="Phone"
                name="Phone"
                value={formData.phone}
                onChange={updateField("phone")}
                placeholder="----------"
                maxLength={70}
                isExporting={isExporting}
              />
              <LabeledTextInputRow
                label="Email"
                name="Email"
                value={formData.invoicePrimary}
                onChange={updateField("invoicePrimary")}
                placeholder="----------"
                maxLength={70}
                isExporting={isExporting}
              />
              <LabeledTextInputRow
                label="Invoice"
                name="Invoice"
                value={formData.invoiceSecondary}
                onChange={updateField("invoiceSecondary")}
                placeholder="----------"
                maxLength={70}
                isExporting={isExporting}
              />
              <LabeledDatePickerRow
                label="Invoice Date"
                name="dateOfIncident"
                selected={dateOfIncident}
                onChange={(date) => setDateOfIncident(date)}
                dateFormat="MM/dd/yy"
                placeholderText="MM/DD/YY"
                isExporting={isExporting}
              />
              <LabeledTextInputRow
                label="Model"
                name="Model"
                value={formData.model}
                onChange={updateField("model")}
                placeholder="----------"
                maxLength={70}
                isExporting={isExporting}
              />
              <LabeledTextInputRow
                label="VIN"
                name="VIN"
                value={formData.vin}
                onChange={updateField("vin")}
                placeholder="----------"
                maxLength={70}
                isExporting={isExporting}
              />
              <LabeledTextInputRow
                label="Original Mileage"
                name="Original Mileage"
                value={formData.originalMileage}
                onChange={updateField("originalMileage")}
                placeholder="----------"
                maxLength={70}
                isExporting={isExporting}
              />
              <LabeledTextInputRow
                label="Current Mileage"
                name="Current Mileage"
                value={formData.currentMileage}
                onChange={updateField("currentMileage")}
                placeholder="----------"
                maxLength={70}
                isExporting={isExporting}
                alignItems="center"
              />
              <LabeledTextInputRow
                label="Transmission"
                name="Transmission"
                value={formData.transmission}
                onChange={updateField("transmission")}
                placeholder="----------"
                maxLength={70}
                isExporting={isExporting}
                alignItems="center"
              />
              <LabeledTextInputRow
                label="Serial Number"
                name="Serial Number"
                value={formData.serialNumber}
                onChange={updateField("serialNumber")}
                placeholder="----------"
                maxLength={20}
                isExporting={isExporting}
                alignItems="center"
              />
              <LabeledTextInputRow
                label="Tested"
                name="Tested"
                value={formData.tested}
                onChange={updateField("tested")}
                placeholder="----------"
                maxLength={70}
                isExporting={isExporting}
                alignItems="center"
              />
              <LabeledTextInputRow
                label="Programming"
                name="Programming"
                value={formData.programming}
                onChange={updateField("programming")}
                placeholder="----------"
                maxLength={70}
                isExporting={isExporting}
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
          </ResponsivePage>
        </div>

        <div className="mt-4 sm:mt-6 flex flex-wrap justify-center gap-3">
          <button
            ref={downloadButtonRef}
            type="button"
            onClick={downloadPdf}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 w-full sm:w-auto"
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
  paddingTop: "160px",
  boxSizing: "border-box",
};

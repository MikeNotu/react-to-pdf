import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

type AlignItems = "baseline" | "center" | "flex-start";

export type LabeledDatePickerRowProps = Readonly<{
  label: string;
  name: string;
  selected: Date | null;
  onChange: (date: Date | null) => void;
  dateFormat: string;
  required?: boolean;
  isExporting?: boolean;
  placeholderText?: string;
  alignItems?: AlignItems;
}>;

export function LabeledDatePickerRow({
  label,
  name,
  selected,
  onChange,
  dateFormat,
  required = true,
  isExporting = false,
  placeholderText,
  alignItems = "baseline",
}: LabeledDatePickerRowProps) {
  return (
    <div
      className="mb-2 flex flex-row"
      style={rowStyle(alignItems)}
    >
      <p className="h-12 inline-block align-middle" style={labelBaseStyle}>
        {label}:
      </p>
      <div style={fieldContainerStyle}>
        <DatePicker
          selected={selected}
          onChange={onChange}
          dateFormat={dateFormat}
          required={required}
          placeholderText={placeholderText}
          wrapperClassName="w-full"
          customInput={
            <input
              name={name}
              className="w-full"
              style={inputStyle(isExporting)}
            />
          }
        />
      </div>
    </div>
  );
}

const labelBaseStyle: React.CSSProperties = {
  fontSize: "24px",
  fontWeight: "bold",
  marginRight: "1rem",
  marginTop: "0.5rem",
  minWidth: "5.25rem",
};

const inputBaseStyle: React.CSSProperties = {
  fontSize: "20px",
  display: "block",
  height: "30px",
  lineHeight: "normal",
  padding: "2px 0.375rem",
  flex: 1,
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #d1d5db",
  borderRadius: "0.125rem",
};

const inputStyle = (isExporting: boolean): React.CSSProperties => ({
  ...inputBaseStyle,
  ...(isExporting
    ? {
        border: "none",
        borderRadius: 0,
        backgroundColor: "transparent",
        boxShadow: "none",
        padding: 0,
      }
    : {}),
});

const fieldContainerStyle: React.CSSProperties = {
  flex: 1,
  width: "100%",
};

const rowStyle = (alignItems: AlignItems): React.CSSProperties => ({
  display: "flex",
  alignItems,
});

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
          customInput={<input name={name} className="w-full" style={inputBaseStyle} />}
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
  display: "flex",
  height: "20px",
  flex: 1,
  width: "100%",
  boxSizing: "border-box",
};

const fieldContainerStyle: React.CSSProperties = {
  flex: 1,
  width: "100%",
};

const rowStyle = (alignItems: AlignItems): React.CSSProperties => ({
  display: "flex",
  alignItems,
});

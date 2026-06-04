import React from "react";

type AlignItems = "baseline" | "center" | "flex-start";

export type LabeledTextInputRowProps = Readonly<{
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  maxLength: number;
  required?: boolean;
  isExporting?: boolean;
  alignItems?: AlignItems;
  labelClassName?: string;
}>;

export function LabeledTextInputRow({
  label,
  name,
  value,
  onChange,
  placeholder,
  maxLength,
  required = true,
  isExporting = false,
  alignItems = "baseline",
  labelClassName = "h-12 inline-block align-middle",
}: LabeledTextInputRowProps) {
  return (
    <div className="mb-2 flex flex-row" style={rowStyle(alignItems)}>
      <p className={labelClassName} style={labelBaseStyle}>
        {label}:
      </p>
      <input
        type="text"
        name={name}
        placeholder={placeholder}
        maxLength={maxLength}
        required={required}
        value={value}
        onChange={onChange}
        style={inputStyle(isExporting)}
      />
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

const rowStyle = (alignItems: AlignItems): React.CSSProperties => ({
  display: "flex",
  alignItems,
});

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
  alignItems = "baseline",
  labelClassName = "h-12 inline-block align-middle",
}: LabeledTextInputRowProps) {
  return (
    <div
      className="mb-2 flex flex-row"
      style={rowStyle(alignItems)}
    >
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
        style={inputBaseStyle}
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
  display: "flex",
  height: "20px",
  flex: 1,
  width: "100%",
  boxSizing: "border-box",
};

const rowStyle = (alignItems: AlignItems): React.CSSProperties => ({
  display: "flex",
  alignItems,
});

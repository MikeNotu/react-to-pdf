import React from "react";

export type PerCustomerFieldProps = Readonly<{
  label: string;
  name: string;
  isExporting: boolean;
  value: string;
  maxLength: number;
  rows?: number;
  height?: number;
  onChange: (value: string) => void;
  clampValue: (value: string, maxLength: number) => string;
}>;

export function PerCustomerField({
  label,
  name,
  isExporting,
  value,
  maxLength,
  rows = 3,
  height = 92,
  onChange,
  clampValue,
}: PerCustomerFieldProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);

  React.useLayoutEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea || isExporting) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.max(height, textarea.scrollHeight)}px`;
  }, [height, isExporting, value]);

  return (
    <div
      className="mb-2 flex flex-row"
      style={rowStyle}
    >
      <p className="inline-block align-middle" style={labelBaseStyle}>
        {label}:
      </p>

      {/* Editable input (hidden during export so PDF captures full content) */}
      <div style={fieldContainerStyle}>
        {isExporting ? null : (
          <textarea
            ref={textareaRef}
            name={name}
            placeholder={`Up to ${maxLength} characters...`}
            value={value}
            maxLength={maxLength}
            onChange={(e) => onChange(clampValue(e.target.value, maxLength))}
            rows={rows}
            style={{
              fontSize: "16px",
              width: "100%",
              resize: "none",
              minHeight: `${height}px`,
              height: `${height}px`,
              padding: "0.5rem",
              border: "1px solid #d1d5db",
              borderRadius: "0.375rem",
              boxSizing: "border-box",
              overflow: "hidden",
            }}
          />
        )}

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
              minHeight: `${height}px`,
              ...(isExporting
                ? {
                    border: "none",
                    borderRadius: 0,
                    padding: 0,
                    backgroundColor: "transparent",
                  }
                : {}),
            }}
          >
            {value}
          </div>
        ) : null}
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

const rowStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
};

const fieldContainerStyle: React.CSSProperties = {
  flex: 1,
  width: "100%",
};

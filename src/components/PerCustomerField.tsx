import React from "react";

export type PerCustomerFieldProps = Readonly<{
  isExporting: boolean;
  multiline: string;
  onChangeMultiline: (value: string) => void;
  clampToMaxLines: (value: string) => string;
}>;

export function PerCustomerField({
  isExporting,
  multiline,
  onChangeMultiline,
  clampToMaxLines,
}: PerCustomerFieldProps) {
  return (
    <div
      className="mb-2 flex flex-row"
      style={rowStyle}
    >
      <p className="inline-block align-middle" style={labelBaseStyle}>
        PER CUSTOMER:
      </p>

      {/* Editable input (hidden during export so PDF captures full content) */}
      <div style={fieldContainerStyle}>
        {isExporting ? null : (
          <textarea
            name="multiline"
            placeholder="Up to 500 lines…"
            value={multiline}
            maxLength={500}
            onChange={(e) => onChangeMultiline(clampToMaxLines(e.target.value))}
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
              minHeight: "2.5rem",
            }}
          >
            {multiline}
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
  height: "180px",
};

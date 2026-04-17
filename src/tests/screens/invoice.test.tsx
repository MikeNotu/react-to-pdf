import type * as React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Invoice } from "../../screens/invoice";

jest.mock("../../components/LabeledTextInputRow", () => ({
  LabeledTextInputRow: ({
    label,
    name,
    value,
    onChange,
    placeholder,
    maxLength,
    alignItems,
  }: {
    label: string;
    name: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    placeholder: string;
    maxLength: number;
    alignItems?: string;
  }) => (
    <div data-testid={`row-${name}`} data-align={alignItems}>
      <label htmlFor={name}>{label}:</label>
      <input
        id={name}
        name={name}
        placeholder={placeholder}
        maxLength={maxLength}
        value={value}
        onChange={onChange}
      />
    </div>
  ),
}));

jest.mock("../../components/LabeledDatePickerRow", () => ({
  LabeledDatePickerRow: ({
    label,
    name,
    placeholderText,
    alignItems,
  }: {
    label: string;
    name: string;
    placeholderText?: string;
    alignItems?: string;
  }) => (
    <div data-testid={`row-${name}`} data-align={alignItems}>
      <label htmlFor={name}>{label}:</label>
      <input id={name} name={name} placeholder={placeholderText ?? "date"} />
    </div>
  ),
}));

jest.mock("../../components/PerCustomerField", () => ({
  PerCustomerField: ({
    multiline,
    isExporting,
  }: {
    multiline: string;
    isExporting: boolean;
  }) => (
    <div data-testid="per-customer-field" data-exporting={isExporting}>
      {isExporting ? <div>{multiline}</div> : <textarea placeholder="Up to 500 lines…" value={multiline} readOnly />}
    </div>
  ),
}));

describe("Invoice screen", () => {
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, "offsetParent", {
      configurable: true,
      get: () => document.body,
    });
  });

  it("renders the invoice form and download button", () => {
    render(<Invoice />);

    expect(screen.getByRole("button", { name: /download pdf/i })).toBeInTheDocument();
    expect(screen.getByTestId("row-Service Call ID")).toBeInTheDocument();
    expect(screen.getByTestId("per-customer-field")).toBeInTheDocument();
  });

  it("moves focus to the next field when Enter is pressed", () => {
    render(<Invoice />);

    const firstField = screen.getByLabelText("Service Call ID:");
    const nextField = screen.getByLabelText("Service Call Date:");

    firstField.focus();
    fireEvent.keyDown(firstField, { key: "Enter", code: "Enter" });

    expect(nextField).toHaveFocus();
  });

  it("moves focus to Download PDF from the last field", () => {
    render(<Invoice />);

    const multiline = screen.getByPlaceholderText("Up to 500 lines…");
    const downloadButton = screen.getByRole("button", { name: /download pdf/i });

    multiline.focus();
    fireEvent.keyDown(multiline, { key: "Enter", code: "Enter" });

    expect(downloadButton).toHaveFocus();
  });
});

import type * as React from "react";
import { fireEvent, screen } from "@testing-library/react";
import { Invoice } from "../../screens/invoice";
import { renderWithProviders } from "../testUtils";

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

jest.mock("../../utils/readMediaFile", () => ({
  isMediaFile: (file: File) =>
    /\.(jpe?g|png|pdf)$/i.test(file.name) ||
    file.type === "application/pdf" ||
    file.type.startsWith("image/"),
  readMediaFile: jest.fn(async () => "data:image/png;base64,mock"),
  defaultLogoPlacement: jest.fn(async (src: string) => ({
    src,
    x: 650,
    y: 16,
    width: 120,
    height: 80,
  })),
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
    renderWithProviders(<Invoice />);

    expect(screen.getByRole("button", { name: /download pdf/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add logo/i })).toBeInTheDocument();
    expect(screen.getByTestId("row-Service Call ID")).toBeInTheDocument();
    expect(screen.getByTestId("per-customer-field")).toBeInTheDocument();
  });

  it("shows remove logo after a logo file is selected", async () => {
    renderWithProviders(<Invoice />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["logo"], "logo.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(await screen.findByRole("button", { name: /remove logo/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /change logo/i })).toBeInTheDocument();
    expect(screen.getByAltText("Company logo")).toBeInTheDocument();
  });

  it("moves focus to the next field when Enter is pressed", () => {
    renderWithProviders(<Invoice />);

    const firstField = screen.getByLabelText("Service Call ID:");
    const nextField = screen.getByLabelText("Service Call Date:");

    firstField.focus();
    fireEvent.keyDown(firstField, { key: "Enter", code: "Enter" });

    expect(nextField).toHaveFocus();
  });

  it("moves focus to Download PDF from the last field", () => {
    renderWithProviders(<Invoice />);

    const multiline = screen.getByPlaceholderText("Up to 500 lines…");
    const downloadButton = screen.getByRole("button", { name: /download pdf/i });

    multiline.focus();
    fireEvent.keyDown(multiline, { key: "Enter", code: "Enter" });

    expect(downloadButton).toHaveFocus();
  });
});

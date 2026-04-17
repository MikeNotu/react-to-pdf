import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { LabeledDatePickerRow } from "../../components/LabeledDatePickerRow";
import * as ReactLib from "react";
jest.mock("react-datepicker", () => {
  return function MockDatePicker(props: {
    customInput: React.ReactElement<
      React.InputHTMLAttributes<HTMLInputElement>
    >;
    onChange?: (date: Date | null) => void;
    required?: boolean;
    placeholderText?: string;
  }) {
    const { customInput, onChange, required, placeholderText } = props;

    return ReactLib.cloneElement(customInput, {
      required,
      placeholder: placeholderText,
      onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
        onChange?.(new Date(e.target.value)),
      value: "",
    });
  };
});

describe("LabeledDatePickerRow", () => {
  it("renders label and forwards core input props", () => {
    const onChange = jest.fn();

    render(
      <LabeledDatePickerRow
        label="Invoice Date"
        name="dateOfIncident"
        selected={null}
        onChange={onChange}
        dateFormat="MM/dd/yy"
        placeholderText="MM/DD/YY"
      />,
    );

    expect(screen.getByText("Invoice Date:")).toBeInTheDocument();
    const input = screen.getByPlaceholderText("MM/DD/YY");
    expect(input).toHaveAttribute("name", "dateOfIncident");
    expect(input).toHaveAttribute("placeholder", "MM/DD/YY");
    expect(input).toBeRequired();
  });

  it("calls onChange with a Date when value changes", () => {
    const onChange = jest.fn();

    render(
      <LabeledDatePickerRow
        label="Service Call Date"
        name="dateOfService"
        selected={null}
        onChange={onChange}
        dateFormat="MM/dd/yy"
        alignItems="center"
      />,
    );

    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "2026-01-02" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith(expect.any(Date));
    const row = input.closest("div")?.parentElement;
    expect(row).toHaveStyle({ alignItems: "center" });
  });
});

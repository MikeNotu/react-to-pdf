import { fireEvent, render, screen } from "@testing-library/react";
import { LabeledTextInputRow } from "../../components/LabeledTextInputRow";

describe("LabeledTextInputRow", () => {
  it("renders label and input attributes", () => {
    const onChange = jest.fn();

    render(
      <LabeledTextInputRow
        label="Service Call ID"
        name="serviceCallId"
        value="ABC-123"
        onChange={onChange}
        placeholder="----------"
        maxLength={70}
      />,
    );

    expect(screen.getByText("Service Call ID:")).toBeInTheDocument();
    const input = screen.getByPlaceholderText("----------");
    expect(input).toHaveAttribute("name", "serviceCallId");
    expect(input).toHaveValue("ABC-123");
    expect(input).toHaveAttribute("maxlength", "70");
    expect(input).toBeRequired();
  });

  it("calls onChange and applies row alignment", () => {
    const onChange = jest.fn();

    render(
      <LabeledTextInputRow
        label="Transmission"
        name="transmission"
        value=""
        onChange={onChange}
        placeholder="----------"
        maxLength={70}
        alignItems="center"
      />,
    );

    const input = screen.getByPlaceholderText("----------");
    fireEvent.change(input, { target: { value: "Automatic" } });

    expect(onChange).toHaveBeenCalledTimes(1);
    const row = input.closest("div");
    expect(row).toHaveStyle({ alignItems: "center" });
  });
});

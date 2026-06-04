import { fireEvent, render, screen } from "@testing-library/react";
import { PerCustomerField } from "../../components/PerCustomerField";

describe("PerCustomerField", () => {
  it("renders textarea when not exporting and pipes value through clamp", () => {
    const onChange = jest.fn();
    const clampValue = jest.fn((value: string) => `clamped:${value}`);

    render(
      <PerCustomerField
        label="PER CUSTOMER"
        name="perCustomer"
        isExporting={false}
        value=""
        maxLength={500}
        onChange={onChange}
        clampValue={clampValue}
      />,
    );

    const textarea = screen.getByPlaceholderText("Up to 500 characters...");
    fireEvent.change(textarea, { target: { value: "line 1\nline 2" } });

    expect(clampValue).toHaveBeenCalledWith("line 1\nline 2", 500);
    expect(onChange).toHaveBeenCalledWith("clamped:line 1\nline 2");
  });

  it("renders PDF content view when exporting", () => {
    render(
      <PerCustomerField
        label="PER CUSTOMER"
        name="perCustomer"
        isExporting
        value={"hello\nworld"}
        maxLength={500}
        onChange={jest.fn()}
        clampValue={(value) => value}
      />,
    );

    expect(
      screen.queryByPlaceholderText("Up to 500 characters..."),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/hello\s+world/)).toBeInTheDocument();
  });
});

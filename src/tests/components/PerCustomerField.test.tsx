import { fireEvent, render, screen } from "@testing-library/react";
import { PerCustomerField } from "../../components/PerCustomerField";

describe("PerCustomerField", () => {
  it("renders textarea when not exporting and pipes value through clamp", () => {
    const onChangeMultiline = jest.fn();
    const clampToMaxLines = jest.fn((value: string) => `clamped:${value}`);

    render(
      <PerCustomerField
        isExporting={false}
        multiline=""
        onChangeMultiline={onChangeMultiline}
        clampToMaxLines={clampToMaxLines}
      />,
    );

    const textarea = screen.getByPlaceholderText("Up to 500 lines…");
    fireEvent.change(textarea, { target: { value: "line 1\nline 2" } });

    expect(clampToMaxLines).toHaveBeenCalledWith("line 1\nline 2");
    expect(onChangeMultiline).toHaveBeenCalledWith("clamped:line 1\nline 2");
  });

  it("renders PDF content view when exporting", () => {
    render(
      <PerCustomerField
        isExporting
        multiline={"hello\nworld"}
        onChangeMultiline={jest.fn()}
        clampToMaxLines={(value) => value}
      />,
    );

    expect(
      screen.queryByPlaceholderText("Up to 500 lines…"),
    ).not.toBeInTheDocument();
    expect(screen.getByText(/hello\s+world/)).toBeInTheDocument();
  });
});

import { fireEvent, render, screen } from "@testing-library/react";
import { MediaFilePickerButton } from "../../components/MediaFilePickerButton";

describe("MediaFilePickerButton", () => {
  it("opens file selection and passes chosen files to the handler", async () => {
    const onFilesSelected = jest.fn();
    render(
      <MediaFilePickerButton
        label="Add Files"
        multiple
        onFilesSelected={onFilesSelected}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /add files/i }));

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["img"], "scan.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(onFilesSelected).toHaveBeenCalledWith([file]);
  });
});

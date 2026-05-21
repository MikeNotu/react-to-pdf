import { fireEvent, screen } from "@testing-library/react";
import { Attachments } from "../../screens/attachments";
import { renderWithProviders } from "../testUtils";

jest.mock("../../utils/readMediaFile", () => ({
  isMediaFile: () => true,
  readMediaFile: jest.fn(async () => "data:image/png;base64,mock"),
  defaultAttachmentPlacement: jest.fn(async (src: string, _bounds: unknown, index: number) => ({
    src,
    x: 40 + index * 36,
    y: 40,
    width: 200,
    height: 150,
  })),
}));

let uuidCount = 0;

jest.mock("../../utils/exportLetterPage", () => ({
  captureLetterPageElement: jest.fn(async () => "data:image/png;base64,capture"),
  exportLetterPageToPdf: jest.fn(),
  exportLetterPagesToPdf: jest.fn(),
  exportLetterPagesFromDataUrls: jest.fn(),
}));

describe("Attachments screen", () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, "crypto", {
      value: {
        randomUUID: () => `test-uuid-${++uuidCount}`,
      },
      configurable: true,
    });
  });

  beforeEach(() => {
    uuidCount = 0;
  });

  it("renders add files and download controls", () => {
    renderWithProviders(<Attachments />);

    expect(screen.getByRole("button", { name: /add files/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /download pdf/i })).toBeEnabled();
  });

  it("adds a placed image after selecting a file", async () => {
    renderWithProviders(<Attachments />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["img"], "scan.png", { type: "image/png" });

    fireEvent.change(input, { target: { files: [file] } });

    expect(
      await screen.findByAltText("Page 1 attachment 1"),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Delete Page 1 attachment 1")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /download pdf/i })).toBeEnabled();
  });

  it("adds and switches between multiple pages", async () => {
    renderWithProviders(<Attachments />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [new File(["img"], "scan.png", { type: "image/png" })] },
    });

    expect(
      await screen.findByAltText("Page 1 attachment 1"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /add page/i }));
    expect(screen.getByRole("button", { name: /page 2/i })).toBeInTheDocument();
    expect(screen.queryByAltText("Page 1 attachment 1")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /page 1/i }));
    expect(screen.getByAltText("Page 1 attachment 1")).toBeInTheDocument();
  });

  it("removes the active page when remove page is clicked", () => {
    renderWithProviders(<Attachments />);

    fireEvent.click(screen.getByRole("button", { name: /add page/i }));
    fireEvent.click(screen.getByRole("button", { name: /remove page/i }));

    expect(screen.getByRole("button", { name: /page 1/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /page 2/i })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /remove page/i }),
    ).not.toBeInTheDocument();
  });

  it("removes a placed image when delete is clicked", async () => {
    renderWithProviders(<Attachments />);

    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, {
      target: { files: [new File(["img"], "scan.png", { type: "image/png" })] },
    });

    const deleteButton = await screen.findByLabelText("Delete Page 1 attachment 1");
    fireEvent.click(deleteButton);

    expect(screen.queryByAltText("Page 1 attachment 1")).not.toBeInTheDocument();
  });
});

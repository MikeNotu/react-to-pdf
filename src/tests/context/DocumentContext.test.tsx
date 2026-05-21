import { fireEvent, screen, waitFor } from "@testing-library/react";
import { exportLetterPagesFromDataUrls } from "../../utils/exportLetterPage";
import { Attachments } from "../../screens/attachments";
import { Invoice } from "../../screens/invoice";
import { renderWithProviders } from "../testUtils";

jest.mock("../../utils/exportLetterPage", () => ({
  captureLetterPageElement: jest.fn(async () => "data:image/png;base64,capture"),
  exportLetterPageToPdf: jest.fn(),
  exportLetterPagesToPdf: jest.fn(),
  exportLetterPagesFromDataUrls: jest.fn(),
}));

jest.mock("../../utils/readMediaFile", () => ({
  isMediaFile: () => true,
  readMediaFile: jest.fn(async () => "data:image/png;base64,mock"),
  defaultLogoPlacement: jest.fn(async (src: string) => ({
    src,
    x: 650,
    y: 16,
    width: 120,
    height: 80,
  })),
  defaultAttachmentPlacement: jest.fn(async (src: string, _bounds: unknown, index: number) => ({
    src,
    x: 40 + index * 36,
    y: 40,
    width: 200,
    height: 150,
  })),
}));

describe("DocumentContext PDF export", () => {
  beforeAll(() => {
    Object.defineProperty(globalThis, "crypto", {
      value: { randomUUID: () => "test-uuid" },
      configurable: true,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("exports only the service form when attachments are empty", async () => {
    renderWithProviders(
      <>
        <Invoice />
        <Attachments />
      </>,
    );

    fireEvent.click(screen.getAllByRole("button", { name: /download pdf/i })[0]);

    await waitFor(() =>
      expect(exportLetterPagesFromDataUrls).toHaveBeenCalledTimes(1),
    );
    expect(exportLetterPagesFromDataUrls).toHaveBeenCalledWith(
      ["data:image/png;base64,capture"],
      "service.pdf",
    );
  });

  it("exports service form and attachment pages when attachments have files", async () => {
    renderWithProviders(
      <>
        <Invoice />
        <Attachments />
      </>,
    );

    const attachmentInput = document.querySelector(
      'input[type="file"][multiple]',
    ) as HTMLInputElement;
    fireEvent.change(attachmentInput, {
      target: { files: [new File(["img"], "scan.png", { type: "image/png" })] },
    });

    await screen.findByAltText("Page 1 attachment 1");

    fireEvent.click(screen.getAllByRole("button", { name: /download pdf/i })[0]);

    await waitFor(() =>
      expect(exportLetterPagesFromDataUrls).toHaveBeenCalledTimes(1),
    );
    const pageDataUrls = (exportLetterPagesFromDataUrls as jest.Mock).mock
      .calls[0][0];
    expect(pageDataUrls).toHaveLength(2);
  });
});

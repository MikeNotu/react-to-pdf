import {
  defaultAttachmentPlacement,
  defaultLogoPlacement,
  isMediaFile,
  readMediaFile,
} from "../../utils/readMediaFile";

jest.mock("../../utils/renderPdfPage", () => ({
  renderPdfFirstPageToDataUrl: jest.fn(async () => "data:image/png;base64,pdf"),
}));

describe("readMediaFile", () => {
  it("accepts jpg, png, and pdf files", () => {
    expect(isMediaFile(new File(["x"], "logo.jpg", { type: "image/jpeg" }))).toBe(
      true,
    );
    expect(isMediaFile(new File(["x"], "logo.png", { type: "image/png" }))).toBe(
      true,
    );
    expect(
      isMediaFile(new File(["x"], "logo.pdf", { type: "application/pdf" })),
    ).toBe(true);
    expect(isMediaFile(new File(["x"], "logo.gif", { type: "image/gif" }))).toBe(
      false,
    );
  });

  it("reads image files as a data URL", async () => {
    const file = new File(["img"], "logo.png", { type: "image/png" });
    const result = await readMediaFile(file);
    expect(result).toMatch(/^data:image\/png;base64,/);
  });

  it("reads pdf files via the pdf renderer", async () => {
    const file = new File(["pdf"], "logo.pdf", { type: "application/pdf" });
    const result = await readMediaFile(file);
    expect(result).toBe("data:image/png;base64,pdf");
  });

  it("places logos in the top-right by default", async () => {
    const placement = await defaultLogoPlacement(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      { width: 816, height: 1056 },
    );
    expect(placement.x).toBeGreaterThan(600);
    expect(placement.y).toBe(16);
  });

  it("staggers attachment placements on the page", async () => {
    const first = await defaultAttachmentPlacement(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      { width: 816, height: 1056 },
      0,
    );
    const second = await defaultAttachmentPlacement(
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==",
      { width: 816, height: 1056 },
      1,
    );
    expect(second.x).toBeGreaterThanOrEqual(first.x);
    expect(second.y).toBeGreaterThanOrEqual(first.y);
  });
});

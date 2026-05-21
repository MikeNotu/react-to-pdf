import { loadPlacedMediaFiles } from "../../utils/loadPlacedMediaFiles";

jest.mock("../../utils/readMediaFile", () => ({
  isMediaFile: () => true,
  readMediaFile: jest.fn(async () => "data:image/png;base64,mock"),
}));

describe("loadPlacedMediaFiles", () => {
  it("loads multiple files with sequential placement indices", async () => {
    const createPlacement = jest.fn(async (src: string, index: number) => ({
      src,
      x: index * 10,
      y: 20,
      width: 100,
      height: 80,
    }));

    const result = await loadPlacedMediaFiles(
      [
        new File(["a"], "a.png", { type: "image/png" }),
        new File(["b"], "b.png", { type: "image/png" }),
      ],
      createPlacement,
      () => "id-1",
    );

    expect(result).toHaveLength(2);
    expect(createPlacement).toHaveBeenNthCalledWith(1, "data:image/png;base64,mock", 0);
    expect(createPlacement).toHaveBeenNthCalledWith(2, "data:image/png;base64,mock", 1);
  });
});

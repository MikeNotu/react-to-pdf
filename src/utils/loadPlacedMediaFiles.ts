import { MEDIA_FILE_ERROR } from "../constants/mediaFiles";
import {
  isMediaFile,
  readMediaFile,
  type ImagePlacement,
} from "./readMediaFile";

export async function loadPlacedMediaFiles(
  files: File[],
  createPlacement: (
    src: string,
    index: number,
  ) => Promise<ImagePlacement>,
  createId: () => string,
): Promise<Array<ImagePlacement & { id: string }>> {
  if (files.length === 0) return [];

  const invalid = files.find((file) => !isMediaFile(file));
  if (invalid) {
    throw new Error(MEDIA_FILE_ERROR);
  }

  const placed: Array<ImagePlacement & { id: string }> = [];

  for (const [index, file] of files.entries()) {
    const src = await readMediaFile(file);
    const placement = await createPlacement(src, index);
    placed.push({ ...placement, id: createId() });
  }

  return placed;
}

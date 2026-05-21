import type { ImagePlacement } from "../utils/readMediaFile";

export type PlacedAttachment = ImagePlacement & { id: string };

export type AttachmentPage = {
  id: string;
  items: PlacedAttachment[];
};

export const createAttachmentPage = (): AttachmentPage => ({
  id: crypto.randomUUID(),
  items: [],
});

const IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
]);
const IMAGE_EXTENSIONS = /\.(jpe?g|png)$/i;
const PDF_EXTENSION = /\.pdf$/i;

export function isMediaFile(file: File): boolean {
  if (file.type === "application/pdf" || PDF_EXTENSION.test(file.name)) {
    return true;
  }
  if (IMAGE_TYPES.has(file.type)) return true;
  return IMAGE_EXTENSIONS.test(file.name);
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
      } else {
        reject(new Error("Failed to read image file."));
      }
    };
    reader.onerror = () =>
      reject(reader.error ?? new Error("Failed to read image file."));
    reader.readAsDataURL(file);
  });
}

export async function readMediaFile(file: File): Promise<string> {
  if (!isMediaFile(file)) {
    throw new Error("File must be a JPG, PNG, or PDF.");
  }

  if (
    file.type === "application/pdf" ||
    file.name.toLowerCase().endsWith(".pdf")
  ) {
    const { renderPdfFirstPageToDataUrl } = await import("./renderPdfPage");
    return renderPdfFirstPageToDataUrl(file);
  }

  return readFileAsDataUrl(file);
}

export type ImagePlacement = {
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
};

type PlacementOptions = {
  maxWidth: number;
  maxHeight: number;
  fallbackWidth: number;
  fallbackHeight: number;
  position: (
    width: number,
    height: number,
    bounds: { width: number; height: number },
    index: number,
  ) => { x: number; y: number };
};

function computePlacement(
  src: string,
  bounds: { width: number; height: number },
  index: number,
  options: PlacementOptions,
): Promise<ImagePlacement> {
  return new Promise((resolve) => {
    const { x, y } = options.position(
      options.fallbackWidth,
      options.fallbackHeight,
      bounds,
      index,
    );
    const fallback: ImagePlacement = {
      src,
      width: options.fallbackWidth,
      height: options.fallbackHeight,
      x,
      y,
    };

    const finish = (placement: ImagePlacement) => {
      clearTimeout(timer);
      resolve(placement);
    };

    const timer = setTimeout(() => finish(fallback), 500);
    const img = new Image();
    img.onload = () => {
      let width = img.naturalWidth;
      let height = img.naturalHeight;
      const scale = Math.min(
        options.maxWidth / width,
        options.maxHeight / height,
        1,
      );
      width = Math.round(width * scale);
      height = Math.round(height * scale);
      const position = options.position(width, height, bounds, index);
      finish({
        src,
        width,
        height,
        x: position.x,
        y: position.y,
      });
    };
    img.onerror = () => finish(fallback);
    img.src = src;
  });
}

export function defaultLogoPlacement(
  src: string,
  bounds: { width: number; height: number },
): Promise<ImagePlacement> {
  return computePlacement(src, bounds, 0, {
    maxWidth: 160,
    maxHeight: 100,
    fallbackWidth: 120,
    fallbackHeight: 80,
    position: (width, _height, pageBounds) => ({
      x: pageBounds.width - width - 16,
      y: 16,
    }),
  });
}

export function defaultAttachmentPlacement(
  src: string,
  bounds: { width: number; height: number },
  index: number,
): Promise<ImagePlacement> {
  return computePlacement(src, bounds, index, {
    maxWidth: 280,
    maxHeight: 220,
    fallbackWidth: 200,
    fallbackHeight: 150,
    position: (width, height, pageBounds, itemIndex) => ({
      x: Math.min(40 + (itemIndex % 4) * 36, pageBounds.width - width - 16),
      y: Math.min(40 + Math.floor(itemIndex / 4) * 36, pageBounds.height - height - 16),
    }),
  });
}

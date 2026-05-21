import React from "react";
import type { ImagePlacement } from "../utils/readMediaFile";

const MIN_SIZE = 24;

export type PlacedImageProps = Readonly<{
  placement: ImagePlacement;
  onPlacementChange: (placement: ImagePlacement) => void;
  isExporting: boolean;
  bounds: { width: number; height: number };
  alt: string;
  zIndex?: number;
  onDelete?: () => void;
  onSelect?: () => void;
}>;

type PointerSession = {
  pointerId: number;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  originWidth: number;
  originHeight: number;
};

export function PlacedImage({
  placement,
  onPlacementChange,
  isExporting,
  bounds,
  alt,
  zIndex = 20,
  onDelete,
  onSelect,
}: PlacedImageProps) {
  const { src, x, y, width, height } = placement;

  const clampPosition = React.useCallback(
    (nextX: number, nextY: number, itemWidth: number, itemHeight: number) => ({
      x: Math.min(Math.max(nextX, 0), bounds.width - itemWidth),
      y: Math.min(Math.max(nextY, 0), bounds.height - itemHeight),
    }),
    [bounds.height, bounds.width],
  );

  const clampSize = React.useCallback(
    (
      nextWidth: number,
      nextHeight: number,
      itemX: number,
      itemY: number,
    ) => ({
      width: Math.min(Math.max(nextWidth, MIN_SIZE), bounds.width - itemX),
      height: Math.min(Math.max(nextHeight, MIN_SIZE), bounds.height - itemY),
    }),
    [bounds.height, bounds.width],
  );

  const capturePointer = (target: HTMLElement, pointerId: number) => {
    try {
      target.setPointerCapture(pointerId);
    } catch {
      // jsdom and some browsers may not support pointer capture
    }
  };

  const releasePointer = (target: HTMLElement, pointerId: number) => {
    try {
      target.releasePointerCapture(pointerId);
    } catch {
      // ignore
    }
  };

  const isPrimaryPointer = (button: number) => button === 0;

  const attachPointerSession = (
    event: React.PointerEvent<HTMLElement>,
    onMove: (moveEvent: PointerEvent, session: PointerSession) => void,
  ) => {
    capturePointer(event.currentTarget, event.pointerId);

    const session: PointerSession = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: x,
      originY: y,
      originWidth: width,
      originHeight: height,
    };

    const handleMove = (moveEvent: PointerEvent) => {
      if (moveEvent.pointerId !== session.pointerId) return;
      onMove(moveEvent, session);
    };

    const handleUp = (upEvent: PointerEvent) => {
      if (upEvent.pointerId !== session.pointerId) return;
      releasePointer(event.currentTarget, session.pointerId);
      globalThis.removeEventListener("pointermove", handleMove);
      globalThis.removeEventListener("pointerup", handleUp);
      globalThis.removeEventListener("pointercancel", handleUp);
    };

    globalThis.addEventListener("pointermove", handleMove);
    globalThis.addEventListener("pointerup", handleUp);
    globalThis.addEventListener("pointercancel", handleUp);
  };

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (isExporting || !isPrimaryPointer(event.button)) return;
    event.preventDefault();
    onSelect?.();
    attachPointerSession(event, (_moveEvent, session) => {
      const deltaX = _moveEvent.clientX - session.startX;
      const deltaY = _moveEvent.clientY - session.startY;
      const position = clampPosition(
        session.originX + deltaX,
        session.originY + deltaY,
        session.originWidth,
        session.originHeight,
      );
      onPlacementChange({ ...placement, ...position });
    });
  };

  const startResize = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (isExporting || !isPrimaryPointer(event.button)) return;
    event.preventDefault();
    event.stopPropagation();
    attachPointerSession(event, (_moveEvent, session) => {
      const deltaX = _moveEvent.clientX - session.startX;
      const deltaY = _moveEvent.clientY - session.startY;
      const size = clampSize(
        session.originWidth + deltaX,
        session.originHeight + deltaY,
        session.originX,
        session.originY,
      );
      onPlacementChange({ ...placement, ...size });
    });
  };

  const handleDelete = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onDelete?.();
  };

  return (
    <div
      data-testid="placed-image"
      onPointerDown={startDrag}
      style={{
        position: "absolute",
        left: x,
        top: y,
        width,
        height,
        zIndex,
        touchAction: "none",
        cursor: isExporting ? "default" : "move",
        outline: isExporting ? "none" : "1px dashed #94a3b8",
        backgroundColor: "transparent",
      }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          pointerEvents: "none",
          userSelect: "none",
        }}
      />
      {!isExporting && onDelete ? (
        <button
          type="button"
          aria-label={`Delete ${alt}`}
          data-testid="placed-image-delete"
          onClick={handleDelete}
          className="absolute -left-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white shadow hover:bg-red-700"
        >
          ×
        </button>
      ) : null}
      {isExporting ? null : (
        <button
          type="button"
          aria-label={`Resize ${alt}`}
          data-testid="placed-image-resize"
          onPointerDown={startResize}
          className="absolute -bottom-1 -right-1 h-3.5 w-3.5 cursor-nwse-resize rounded-sm border-2 border-white bg-blue-600 box-border"
        />
      )}
    </div>
  );
}

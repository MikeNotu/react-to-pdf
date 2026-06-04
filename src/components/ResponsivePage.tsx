import React from "react";
import { LETTER_HEIGHT_PX, LETTER_WIDTH_PX } from "../constants/letterPage";
import { letterPageStyle } from "../constants/letterPageStyles";

export type ResponsivePageProps = Readonly<{
  pageRef: (element: HTMLDivElement | null) => void;
  isExporting: boolean;
  className?: string;
  children: React.ReactNode;
}>;

const computeScale = (availableWidth: number) => {
  if (availableWidth <= 0 || availableWidth >= LETTER_WIDTH_PX) return 1;
  return Math.max(0.1, availableWidth / LETTER_WIDTH_PX);
};

export function ResponsivePage({
  pageRef,
  isExporting,
  className,
  children,
}: ResponsivePageProps) {
  const outerRef = React.useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = React.useState(1);

  React.useEffect(() => {
    if (isExporting) {
      setScale(1);
      return;
    }

    const container = outerRef.current?.parentElement;
    if (!container) return;

    const update = () => setScale(computeScale(container.clientWidth));
    update();

    if (globalThis.ResizeObserver) {
      const observer = new globalThis.ResizeObserver(update);
      observer.observe(container);
      return () => observer.disconnect();
    }

    globalThis.window.addEventListener("resize", update);
    return () => globalThis.window.removeEventListener("resize", update);
  }, [isExporting]);

  const appliedScale = isExporting ? 1 : scale;

  return (
    <div
      ref={outerRef}
      style={{
        width: LETTER_WIDTH_PX * appliedScale,
        height: LETTER_HEIGHT_PX * appliedScale,
        flexShrink: 0,
      }}
    >
      <div
        ref={pageRef}
        className={className}
        style={{
          ...letterPageStyle,
          transform: `scale(${appliedScale})`,
          transformOrigin: "top left",
        }}
      >
        {children}
      </div>
    </div>
  );
}

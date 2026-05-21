import type React from "react";
import {
  LETTER_HEIGHT_PX,
  LETTER_WIDTH_PX,
} from "./letterPage";

export const letterPageStyle: React.CSSProperties = {
  position: "relative",
  width: `${LETTER_WIDTH_PX}px`,
  height: `${LETTER_HEIGHT_PX}px`,
  padding: "10px",
  boxSizing: "border-box",
  overflow: "hidden",
};

export const letterPageBounds = {
  width: LETTER_WIDTH_PX,
  height: LETTER_HEIGHT_PX,
};

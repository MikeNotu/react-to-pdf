import type { ReactElement } from "react";
import { render, type RenderOptions } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { DocumentProvider } from "../context/DocumentContext";

export function renderWithProviders(
  ui: ReactElement,
  options?: RenderOptions,
) {
  return render(
    <MemoryRouter>
      <DocumentProvider>{ui}</DocumentProvider>
    </MemoryRouter>,
    options,
  );
}

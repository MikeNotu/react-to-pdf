import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders navigation and the invoice screen by default", () => {
    render(<App />);
    expect(screen.getByRole("link", { name: /service form/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /attachments/i })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /download pdf/i }).length).toBeGreaterThan(0);
  });
});

import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("renders the invoice screen with download action", () => {
    render(<App />);
    expect(screen.getByRole("button", { name: /download pdf/i })).toBeInTheDocument();
  });
});

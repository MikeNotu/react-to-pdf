import { render, screen } from "@testing-library/react";
import { PlacedImage } from "../../components/PlacedImage";
import type { ImagePlacement } from "../../utils/readMediaFile";

const basePlacement: ImagePlacement = {
  src: "data:image/png;base64,test",
  x: 600,
  y: 16,
  width: 120,
  height: 80,
};

describe("PlacedImage", () => {
  it("renders the image", () => {
    render(
      <PlacedImage
        placement={basePlacement}
        onPlacementChange={jest.fn()}
        isExporting={false}
        bounds={{ width: 816, height: 1056 }}
        alt="Company logo"
      />,
    );

    expect(screen.getByAltText("Company logo")).toBeInTheDocument();
    expect(screen.getByTestId("placed-image-resize")).toBeInTheDocument();
  });

  it("hides controls while exporting", () => {
    render(
      <PlacedImage
        placement={basePlacement}
        onPlacementChange={jest.fn()}
        isExporting
        bounds={{ width: 816, height: 1056 }}
        alt="Company logo"
      />,
    );

    expect(screen.queryByTestId("placed-image-resize")).not.toBeInTheDocument();
  });

  it("shows delete button when onDelete is provided", () => {
    render(
      <PlacedImage
        placement={basePlacement}
        onPlacementChange={jest.fn()}
        onDelete={jest.fn()}
        isExporting={false}
        bounds={{ width: 816, height: 1056 }}
        alt="Attachment 1"
      />,
    );

    expect(screen.getByLabelText("Delete Attachment 1")).toBeInTheDocument();
  });

  it("positions with absolute coordinates", () => {
    render(
      <PlacedImage
        placement={basePlacement}
        onPlacementChange={jest.fn()}
        isExporting={false}
        bounds={{ width: 816, height: 1056 }}
        alt="Company logo"
      />,
    );

    const image = screen.getByTestId("placed-image");
    expect(image).toHaveStyle({
      left: "600px",
      top: "16px",
      width: "120px",
      height: "80px",
    });
  });
});

import "@testing-library/jest-dom";

jest.mock("jspdf", () => ({
  __esModule: true,
  default: jest.fn().mockImplementation(() => ({
    getImageProperties: () => ({ width: 1, height: 1 }),
    internal: {
      pageSize: {
        getWidth: () => 1,
      },
    },
    addImage: jest.fn(),
    output: () => new Blob(),
  })),
}));

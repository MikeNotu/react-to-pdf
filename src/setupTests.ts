import "@testing-library/jest-dom";
import { TextDecoder, TextEncoder } from "node:util";

Object.assign(globalThis, {
  TextEncoder,
  TextDecoder,
});

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

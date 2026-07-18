import { test, expect, vi, afterEach, beforeAll } from "vitest";
import { render, screen, fireEvent, cleanup } from "@testing-library/react";
import { MainContent } from "@/app/main-content";

// react-resizable-panels relies on ResizeObserver, which jsdom does not
// implement. Provide a no-op polyfill so MainContent can render.
beforeAll(() => {
  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
});

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

// Mock the context providers so they simply render their children
vi.mock("@/lib/contexts/file-system-context", () => ({
  FileSystemProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

vi.mock("@/lib/contexts/chat-context", () => ({
  ChatProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock the heavy leaf components with identifiable placeholders
vi.mock("@/components/chat/ChatInterface", () => ({
  ChatInterface: () => <div>ChatInterface</div>,
}));

vi.mock("@/components/editor/FileTree", () => ({
  FileTree: () => <div>FileTree</div>,
}));

vi.mock("@/components/editor/CodeEditor", () => ({
  CodeEditor: () => <div>CodeEditor</div>,
}));

vi.mock("@/components/preview/PreviewFrame", () => ({
  PreviewFrame: () => <div>PreviewFrame</div>,
}));

vi.mock("@/components/HeaderActions", () => ({
  HeaderActions: () => <div>HeaderActions</div>,
}));

test("renders the Preview view by default", () => {
  render(<MainContent />);

  expect(screen.getByText("PreviewFrame")).toBeDefined();
  expect(screen.queryByText("CodeEditor")).toBeNull();
});

test("clicking the Code tab switches to the code view", () => {
  render(<MainContent />);

  fireEvent.click(screen.getByRole("tab", { name: "Code" }));

  expect(screen.getByText("CodeEditor")).toBeDefined();
  expect(screen.getByText("FileTree")).toBeDefined();
  expect(screen.queryByText("PreviewFrame")).toBeNull();
});

test("clicking the Preview tab switches back to the preview view", () => {
  render(<MainContent />);

  // Switch to code first...
  fireEvent.click(screen.getByRole("tab", { name: "Code" }));
  expect(screen.getByText("CodeEditor")).toBeDefined();

  // ...then back to preview
  fireEvent.click(screen.getByRole("tab", { name: "Preview" }));
  expect(screen.getByText("PreviewFrame")).toBeDefined();
  expect(screen.queryByText("CodeEditor")).toBeNull();
});

test("the active tab reflects the selected view", () => {
  render(<MainContent />);

  const previewTab = screen.getByRole("tab", { name: "Preview" });
  const codeTab = screen.getByRole("tab", { name: "Code" });

  expect(previewTab.getAttribute("data-state")).toBe("active");
  expect(codeTab.getAttribute("data-state")).toBe("inactive");

  fireEvent.click(codeTab);

  expect(codeTab.getAttribute("data-state")).toBe("active");
  expect(previewTab.getAttribute("data-state")).toBe("inactive");
});

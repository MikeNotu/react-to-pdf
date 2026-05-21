import React from "react";
import { MEDIA_FILE_ACCEPT } from "../constants/mediaFiles";

export type MediaFilePickerButtonProps = Readonly<{
  label: string;
  multiple?: boolean;
  onFilesSelected: (files: File[]) => void | Promise<void>;
  className?: string;
}>;

export function MediaFilePickerButton({
  label,
  multiple = false,
  onFilesSelected,
  className = "flex items-center bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition duration-300 disabled:cursor-not-allowed disabled:opacity-60",
}: MediaFilePickerButtonProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const openPicker = () => {
    const input = inputRef.current;
    if (!input || isLoading) return;
    input.value = "";
    input.click();
  };

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (files.length === 0) return;

    setIsLoading(true);
    try {
      await onFilesSelected(files);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load file.";
      globalThis.alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept={MEDIA_FILE_ACCEPT}
        {...(multiple ? { multiple: true } : {})}
        onChange={handleChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden
      />
      <button
        type="button"
        disabled={isLoading}
        onClick={openPicker}
        className={className}
      >
        {isLoading ? "Loading…" : label}
      </button>
    </>
  );
}

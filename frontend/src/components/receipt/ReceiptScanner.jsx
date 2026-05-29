import { memo, useRef, useState, useCallback } from "react";
import { Upload, Camera, X } from "lucide-react";
import clsx from "clsx";

const ReceiptScanner = memo(function ReceiptScanner({ onFileSelect, preview }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = useCallback(
    (file) => {
      if (file && file.type.startsWith("image/")) {
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleInputChange = useCallback(
    (e) => {
      const file = e.target.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleClear = useCallback(
    (e) => {
      e.stopPropagation();
      onFileSelect(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [onFileSelect]
  );

  return (
    <div
      onClick={() => !preview && fileInputRef.current?.click()}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={clsx(
        "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200",
        preview
          ? "border-indigo-300 bg-indigo-50/30 p-2"
          : "border-gray-300 bg-gray-50 p-10 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50",
        isDragging && "border-indigo-500 bg-indigo-50 scale-[1.01]"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInputChange}
        className="hidden"
      />

      {preview ? (
        <div className="relative w-full">
          <img
            src={preview}
            alt="Preview struk"
            className="w-full max-h-80 object-contain rounded-xl"
          />
          <button
            onClick={handleClear}
            className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 mb-4">
            <Camera className="h-7 w-7 text-indigo-600" />
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">
            Upload foto struk
          </p>
          <p className="text-xs text-gray-400 text-center">
            Drag & drop atau klik untuk memilih file
          </p>
          <div className="flex items-center gap-2 mt-4 text-xs text-gray-300">
            <Upload className="h-3.5 w-3.5" />
            <span>JPG, PNG, WebP • Maks. 5MB</span>
          </div>
        </>
      )}
    </div>
  );
});

export default ReceiptScanner;

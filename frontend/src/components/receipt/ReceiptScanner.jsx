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
        "relative flex flex-col items-center justify-center rounded-3xl border-2 border-dashed transition-all duration-200 group w-full",
        preview
          ? "border-indigo-300 bg-indigo-50/30 dark:bg-indigo-900/10 p-2"
          : "border-[var(--border-color)] bg-[var(--card-bg)] p-12 cursor-pointer hover:border-indigo-600 dark:hover:border-indigo-500 transition-colors shadow-sm",
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
          <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 mb-6 group-hover:scale-110 transition-transform duration-200 shadow-sm">
            <Camera className="h-10 w-10 text-indigo-600" />
          </div>
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">
            Unggah Struk
          </h3>
          <p className="text-sm text-[var(--text-tertiary)] text-center mb-8 px-4 max-w-xs leading-relaxed">
            Tarik file ke sini atau klik untuk mengambil foto struk belanja Anda.
          </p>
          <button
            type="button"
            className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold shadow-lg hover:bg-indigo-700 active:scale-95 transition-all cursor-pointer"
          >
            Scan Struk
          </button>
        </>
      )}
    </div>
  );
});

export default ReceiptScanner;

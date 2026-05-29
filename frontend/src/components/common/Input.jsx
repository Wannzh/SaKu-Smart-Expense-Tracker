import { memo, useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import clsx from "clsx";

const Input = memo(function Input({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  error,
  required = false,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative">
        <input
          id={name}
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={clsx(
            "w-full rounded-xl border px-4 py-3 text-sm text-gray-900 placeholder-gray-400",
            "outline-none transition-all duration-200",
            "focus:ring-2 focus:ring-offset-0",
            isPassword && "pr-11",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-200"
              : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200"
          )}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-500 mt-0.5">{error}</p>
      )}
    </div>
  );
});

export default Input;

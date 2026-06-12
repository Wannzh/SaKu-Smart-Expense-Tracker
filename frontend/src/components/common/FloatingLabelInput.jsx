import { memo } from "react";
import clsx from "clsx";

const FloatingLabelInput = memo(function FloatingLabelInput({
  label,
  id,
  type = "text",
  name,
  value,
  onChange,
  error,
  required = false,
  prefix,
  hint,
  ...props
}) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="relative">
        {prefix && (
          <span className="absolute left-4 top-[17px] text-sm text-[var(--text-primary)] pointer-events-none select-none">
            {prefix}
          </span>
        )}
        <input
          id={id || name}
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder=" " // Required space for peer-placeholder-shown
          required={required}
          className={clsx(
            "peer w-full rounded-xl border px-4 pt-5 pb-2 text-sm",
            "text-[var(--text-primary)] bg-[var(--bg-secondary)]",
            "outline-none transition-all duration-200",
            "focus:ring-2 focus:ring-offset-0",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-950"
              : "border-[var(--border-color)] focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-950",
            prefix && "pl-10"
          )}
          {...props}
        />
        <label
          htmlFor={id || name}
          className={clsx(
            "absolute left-4 top-1.5 text-xs text-[var(--text-tertiary)]",
            "origin-[0] -translate-y-0.5 scale-75 transform transition-all duration-200",
            "peer-placeholder-shown:translate-y-2.5 peer-placeholder-shown:scale-100",
            "peer-focus:top-1.5 peer-focus:-translate-y-0.5 peer-focus:scale-75",
            error ? "peer-focus:text-red-500" : "peer-focus:text-indigo-500",
            "pointer-events-none select-none",
            prefix && "left-10 peer-placeholder-shown:left-10 peer-focus:left-10"
          )}
        >
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      </div>
      {hint && (
        <p className="text-[10px] text-[var(--text-tertiary)] px-1 leading-normal">
          {hint}
        </p>
      )}
      {error && (
        <p className="text-xs text-red-500 px-1">{error}</p>
      )}
    </div>
  );
});

export default FloatingLabelInput;

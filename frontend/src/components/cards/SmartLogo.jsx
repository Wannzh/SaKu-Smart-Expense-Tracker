import { memo, useState } from "react";

const SmartLogo = memo(function SmartLogo({ 
  logo, 
  name, 
  hasWhiteBg = false,
  variant = "card"
}) {
  const [imgError, setImgError] = useState(false);

  if (!logo || imgError) {
    return (
      <span className={`font-black text-lg
        ${variant === "card" 
          ? "text-white" 
          : "text-[var(--text-primary)]"
        }`}>
        {name?.charAt(0) || "?"}
      </span>
    );
  }

  // Logo dengan white wrapper (Dana yang full color)
  if (hasWhiteBg) {
    return (
      <div className={`bg-white rounded-lg 
        flex items-center justify-center
        ${variant === "card" 
          ? "w-10 h-8 p-1"      // Di kartu: ukuran fixed sesuai logo area
          : "w-10 h-8 px-1.5"  // Di picker: sama, jangan full width
        }`}>
        <img
          src={logo}
          alt={name}
          className="w-full h-full object-contain"
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  // Variant CARD → invert putih
  if (variant === "card") {
    return (
      <img
        src={logo}
        alt={name}
        className="w-8 h-8 object-contain filter brightness-0 invert"
        onError={() => setImgError(true)}
      />
    );
  }

  // Variant PICKER → logo asli, ukuran fixed
  return (
    <img
      src={logo}
      alt={name}
      className="w-10 h-8 object-contain"
      onError={() => setImgError(true)}
    />
  );
});

export default SmartLogo;

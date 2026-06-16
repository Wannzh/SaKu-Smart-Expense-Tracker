// BIN Detection & Card Utilities for SaKu

export const BANK_PROFILES = {
  mandiri: {
    name: "Bank Mandiri",
    cardName: "Mandiri",
    gradient: "linear-gradient(135deg, #003087, #0065B3)",
    textColor: "#FFFFFF",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg",
    networkLogo: "VISA", // ← Mandiri pakai jaringan Visa
    prefixes: [
      "4147", "4548", "4549", "4146", "4616", // Mandiri Visa
      "5255", "5256", "5257", "5258", // Mandiri Mastercard
      "6013", "6014", // Mandiri GPN/Maestro
      "008", "013",   // Kode bank Mandiri (rekening)
      "1080",
    ],
  },
  bca: {
    name: "Bank BCA",
    cardName: "BCA",
    gradient: "linear-gradient(135deg, #005BAA, #0077CC)",
    textColor: "#FFFFFF",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg",
    networkLogo: "VISA", // BCA mayoritas Visa
    prefixes: [
      "4553", "4773", // BCA Visa
      "5206", "5219", "5220", "5221", // BCA Mastercard
      "4600",
    ],
  },
  bri: {
    name: "Bank BRI",
    cardName: "BRI", 
    gradient: "linear-gradient(135deg, #003087, #0052CC)",
    textColor: "#FFFFFF",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/68/BANK_BRI_logo.svg",
    networkLogo: "VISA",
    prefixes: [
      "4617", "4618", // BRI Visa
      "5264",         // BRI Mastercard
      "6016", "6021", // BRI GPN
      "002",
    ],
  },
  bni: {
    name: "Bank BNI",
    cardName: "BNI",
    gradient: "linear-gradient(135deg, #FF6600, #CC5200)",
    textColor: "#FFFFFF",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Bank_Negara_Indonesia_logo_%282004%29.svg",
    networkLogo: "VISA",
    prefixes: [
      "4023", "4027", // BNI Visa
      "5256", "5198",         // BNI Mastercard
      "009", "4568",
    ],
  },
  cimb: {
    name: "CIMB Niaga",
    cardName: "CIMB Niaga",
    gradient: "linear-gradient(135deg, #C8102E, #8B0000)",
    textColor: "#FFFFFF",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/dd/CIMB_Niaga_2008.svg",
    networkLogo: "VISA",
    prefixes: ["4549", "5237", "4008"],
  },
  danamon: {
    name: "Bank Danamon",
    cardName: "Danamon",
    gradient: "linear-gradient(135deg, #FF6F00, #FF9E22)",
    textColor: "#FFFFFF",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Danamon_%282024%29.svg",
    networkLogo: "VISA",
    prefixes: ["4000", "4181", "4225", "4246", "4365", "5456", "5521", "6022"],
  },
  btn: {
    name: "Bank BTN",
    cardName: "BTN",
    gradient: "linear-gradient(135deg, #004B87, #0072CE)",
    textColor: "#FFFFFF",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Bank_BTN_logo.svg",
    networkLogo: "VISA",
    prefixes: ["5211", "5265", "6019", "6020"],
  },
  permata: {
    name: "Bank Permata",
    cardName: "Permata",
    gradient: "linear-gradient(135deg, #00875A, #00A86B)",
    textColor: "#FFFFFF",
    logo: "https://upload.wikimedia.org/wikipedia/commons/4/46/PermataBank_%282024%29_prototype_logo.svg",
    networkLogo: "VISA",
    prefixes: ["4025", "4556", "4617", "4988", "5203", "5215", "5422", "6023"],
  },
  maybank: {
    name: "Maybank",
    cardName: "Maybank",
    gradient: "linear-gradient(135deg, #FDB813, #FFD043)",
    textColor: "#333333",
    logo: "https://upload.wikimedia.org/wikipedia/commons/1/1a/Logo_wordmark_Bank_Maybank_Indonesia.png",
    networkLogo: "VISA",
    prefixes: ["4259", "4859", "5412", "5520", "6026"],
  },
  visa: {
    name: "Visa",
    cardName: "Visa Card",
    gradient: "linear-gradient(135deg, #1A1F71, #2D3A8C)",
    textColor: "#FFFFFF",
    logo: "https://upload.wikimedia.org/wikipedia/commons/9/98/Visa_Inc._logo_%282005%E2%80%932014%29.svg",
    networkLogo: "VISA",
    prefixes: ["4"], // ← ini hanya jalan jika tidak ada bank spesifik yang match
  },
  mastercard: {
    name: "Mastercard",
    cardName: "Mastercard",
    gradient: "linear-gradient(135deg, #252525, #404040)",
    textColor: "#FFFFFF",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg",
    networkLogo: "MC",
    prefixes: ["51", "52", "53", "54", "55"],
  },
  gpn: {
    name: "GPN",
    cardName: "Kartu GPN",
    gradient: "linear-gradient(135deg, #C41E3A, #8B0000)",
    textColor: "#FFFFFF",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/83/Gerbang_Pembayaran_Nasional_logo.svg",
    networkLogo: "GPN",
    prefixes: ["6"],
  },
};

export const EWALLET_PROFILES = {
  gopay: {
    name: "GoPay",
    cardName: "GoPay",
    gradient: "linear-gradient(135deg, #00AED6, #0090B0)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg",
    hasWhiteBg: false, 
  },
  dana: {
    name: "DANA",
    cardName: "DANA",
    gradient: "linear-gradient(135deg, #118EEA, #0D6BB5)",
    logo: "/logos/dana.png",
    hasWhiteBg: true, 
  },
  ovo: {
    name: "OVO",
    cardName: "OVO",
    gradient: "linear-gradient(135deg, #4C3494, #352570)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/e/eb/Logo_ovo_purple.svg",
    hasWhiteBg: false,
  },
  shopeepay: {
    name: "ShopeePay",
    cardName: "ShopeePay",
    gradient: "linear-gradient(135deg, #EE4D2D, #CC3D20)",
    logo: "/logos/shopeepay.png",
    hasWhiteBg: false, 
  },
  linkaja: {
    name: "LinkAja",
    cardName: "LinkAja",
    gradient: "linear-gradient(135deg, #E82529, #B51D20)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/8/85/LinkAja.svg",
    hasWhiteBg: true,
  },
};

export function validateEwalletNumber(number) {
  const cleaned = number.replace(/\D/g, "");
  const isValid = /^08\d{8,11}$/.test(cleaned) 
    || cleaned.length >= 10;
  return {
    isValid,
    formatted: cleaned.replace(
      /(\d{4})(\d{4})(\d+)/, "$1 $2 $3"
    ),
    message: isValid 
      ? null 
      : "Masukkan nomor HP yang valid"
  };
}

/**
 * Deteksi bank dari nomor kartu/rekening
 * Cek prefix dari yang paling panjang (lebih spesifik)
 */
export function detectBank(cardNumber) {
  if (!cardNumber) return null;
  const cleaned = cardNumber.replace(/\D/g, "");
  if (cleaned.length < 3) return null;

  // Pisahkan bank spesifik dan network generic
  const specificBanks = Object.entries(BANK_PROFILES)
    .filter(([key]) => 
      !["visa", "mastercard", "gpn"].includes(key)
    );
  
  const networkGeneric = Object.entries(BANK_PROFILES)
    .filter(([key]) => 
      ["visa", "mastercard", "gpn"].includes(key)
    );

  // Step 1: Cek bank spesifik dulu (prefix panjang)
  // Mandiri, BCA, BNI, BRI, dll
  for (let len = 8; len >= 2; len--) {
    const prefix = cleaned.substring(0, len);
    for (const [key, profile] of specificBanks) {
      if (profile.prefixes.some(p => p === prefix)) {
        return { key, ...profile };
      }
    }
  }

  // Step 2: Baru cek network generic (prefix pendek)
  // Visa (4), Mastercard (51-55), GPN (6)
  for (const [key, profile] of networkGeneric) {
    if (profile.prefixes.some(p => 
      cleaned.startsWith(p)
    )) {
      return { key, ...profile };
    }
  }

  return null;
}

/**
 * Format nomor kartu: spasi setiap 4 digit
 * Contoh: "1234567890123456" → "1234 5678 9012 3456"
 */
export function formatCardNumber(value) {
  const cleaned = value.replace(/\D/g, "");
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join(" ").substring(0, 19);
}

/**
 * Mask nomor kartu, tampilkan 4 digit terakhir
 * Contoh: "1234 5678 9012 3456" → "**** **** **** 3456"
 */
export function maskCardNumber(value) {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 4) return cleaned;
  const last4 = cleaned.slice(-4);
  const masked = "•".repeat(
    Math.max(0, cleaned.length - 4)
  );
  const full = masked + last4;
  const groups = full.match(/.{1,4}/g) || [];
  return groups.join(" ");
}

export function normalizeBINResponse(data) {
  if (!data) return null;
  if (data.Status === "SUCCESS" || data.Scheme) {
    return {
      bankName: data.Bank?.Name || "",
      scheme: data.Scheme || "",
      type: data.Type || "",
      brand: data.Brand || "",
      country: data.Country?.Name || ""
    };
  }
  return {
    bankName: data.bank?.name || "",
    scheme: data.scheme || "",
    type: data.type || "",
    brand: data.brand || "",
    country: data.country?.name || ""
  };
}

export function findKnownBankByName(name) {
  if (!name) return null;
  const lowerName = name.toLowerCase();
  
  if (lowerName.includes("central asia") || lowerName.includes("bca")) return "bca";
  if (lowerName.includes("mandiri")) return "mandiri";
  if (lowerName.includes("negara indonesia") || lowerName.includes("bni")) return "bni";
  if (lowerName.includes("rakyat indonesia") || lowerName.includes("bri")) return "bri";
  if (lowerName.includes("cimb") || lowerName.includes("niaga")) return "cimb";
  if (lowerName.includes("danamon")) return "danamon";
  if (lowerName.includes("btn") || lowerName.includes("tabungan negara")) return "btn";
  if (lowerName.includes("permata")) return "permata";
  if (lowerName.includes("maybank") || lowerName.includes("bii")) return "maybank";
  
  return null;
}

export function getGradientByScheme(scheme) {
  const s = (scheme || "").toLowerCase();
  if (s === "visa") {
    return "linear-gradient(135deg, #1A1F71, #2D3A8C)";
  }
  if (s === "mastercard" || s === "mc") {
    return "linear-gradient(135deg, #252525, #404040)";
  }
  if (s === "gpn") {
    return "linear-gradient(135deg, #C41E3A, #8B0000)";
  }
  return null;
}

export function getNetworkLogo(scheme) {
  const s = (scheme || "").toUpperCase();
  if (s === "VISA") return "VISA";
  if (s === "MASTERCARD" || s === "MC") return "MC";
  if (s === "GPN") return "GPN";
  return null;
}

export async function lookupBIN(binNumber) {
  const cleaned = binNumber.replace(/\D/g, "");
  if (cleaned.length < 6) return null;
  const bin = cleaned.substring(0, 6);
  
  try {
    const res = await fetch(`https://data.handyapi.com/bin/${bin}`);
    if (res.ok) {
      const data = await res.json();
      if (data && data.Status !== "FAILED") {
        return normalizeBINResponse(data);
      }
    }
  } catch (err) {
    console.error("handyapi error:", err);
  }
  
  try {
    const res = await fetch(`https://lookup.binlist.net/${bin}`);
    if (res.ok) {
      const data = await res.json();
      return normalizeBINResponse(data);
    }
  } catch (err) {
    console.error("binlist error:", err);
  }
  
  return null;
}

export const REKENING_PROFILES = {
  mandiri: {
    name: "Bank Mandiri",
    gradient: "linear-gradient(135deg, #003087, #0065B3)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg",
    // Nomor rekening Mandiri: 13 digit, mulai 1
    rekeningPrefixes: ["1"],
    format: "XXX-XX-XXXXXXX", // format display
  },
  bca: {
    name: "Bank BCA",
    gradient: "linear-gradient(135deg, #005BAA, #0077CC)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg",
    // Nomor rekening BCA: 10 digit, mulai 0 atau 8
    rekeningPrefixes: ["0", "8"],
    format: "XXX-XXXXXXX",
  },
  bri: {
    name: "Bank BRI",
    gradient: "linear-gradient(135deg, #003087, #0052CC)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/6/68/BANK_BRI_logo.svg",
    // Nomor rekening BRI: 15 digit
    rekeningPrefixes: ["0", "1"],
    format: "XXXXXX.XX.XXXXXX.X",
  },
  bni: {
    name: "Bank BNI",
    gradient: "linear-gradient(135deg, #FF6600, #CC5200)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/f0/Bank_Negara_Indonesia_logo_%282004%29.svg",
    // Nomor rekening BNI: 10 digit
    rekeningPrefixes: ["0", "8"],
    format: "XXXXXXXXXX",
  },
  cimb: {
    name: "CIMB Niaga",
    gradient: "linear-gradient(135deg, #C8102E, #8B0000)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/d/dd/CIMB_Niaga_2008.svg",
    rekeningPrefixes: ["8"],
    format: "XXXXXXXXXXX",
  },
  btn: {
    name: "Bank BTN",
    gradient: "linear-gradient(135deg, #004B87, #0072CE)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/f/fd/Bank_BTN_logo.svg",
    rekeningPrefixes: ["0"],
    format: "XXXXXX-XX-XXXXXXX",
  },
  danamon: {
    name: "Bank Danamon",
    gradient: "linear-gradient(135deg, #FF6F00, #FF9E22)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/a/a1/Danamon_%282024%29.svg",
    rekeningPrefixes: ["0"],
    format: "XXXXXXXXXXX",
  },
};

// Fungsi format nomor rekening untuk display
export function formatRekeningNumber(value) {
  // Bersihkan, hanya angka, max 16 digit
  const cleaned = value.replace(/\D/g, "").substring(0, 16);
  // Tampilkan dengan spasi setiap 4 digit
  const groups = cleaned.match(/.{1,4}/g) || [];
  return groups.join(" ");
}

// Mask nomor rekening — tampilkan 4 digit pertama dan terakhir
export function maskRekeningNumber(value) {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length <= 4) return cleaned;
  const first4 = cleaned.substring(0, 4);
  const last4 = cleaned.slice(-4);
  const middle = "•".repeat(
    Math.max(0, cleaned.length - 8)
  );
  return `${first4} ${middle} ${last4}`.trim();
}

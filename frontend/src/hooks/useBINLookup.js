import { useState, useEffect, useRef } from "react";
import { 
  lookupBIN, 
  detectBank, 
  findKnownBankByName, 
  getGradientByScheme, 
  getNetworkLogo,
  BANK_PROFILES 
} from "../utils/binDetector";

export function useBINLookup(cardNumber) {
  const [isLoading, setIsLoading] = useState(false);
  const [detectedBank, setDetectedBank] = useState(null);
  const [error, setError] = useState(null);
  
  // Track last looked up BIN to avoid duplicate network calls
  const lastLookedUpBIN = useRef("");

  useEffect(() => {
    const raw = (cardNumber || "").replace(/\D/g, "");
    
    // Clear state if input is cleared or too short
    if (raw.length < 3) {
      setDetectedBank(null);
      setError(null);
      setIsLoading(false);
      lastLookedUpBIN.current = "";
      return;
    }

    // Step 1: Local offline check for immediate feedback (Mandiri, BCA, Danamon, BTN, etc.)
    const localMatch = detectBank(raw);
    if (localMatch) {
      setDetectedBank(localMatch);
    }

    // Step 2: If we have at least 6 digits, perform the network lookup
    if (raw.length >= 6) {
      const bin = raw.substring(0, 6);
      
      // If we already looked up this exact BIN, skip network fetch
      if (lastLookedUpBIN.current === bin) {
        return;
      }

      let active = true;
      lastLookedUpBIN.current = bin;
      
      const fetchBIN = async () => {
        setIsLoading(true);
        setError(null);
        
        try {
          const res = await lookupBIN(bin);
          if (!active) return;
          
          if (res) {
            // Check if it's a bank we know locally
            const knownKey = findKnownBankByName(res.bankName);
            if (knownKey && BANK_PROFILES[knownKey]) {
              setDetectedBank({
                key: knownKey,
                ...BANK_PROFILES[knownKey],
                // Merge details if network response has more specific network info
                networkLogo: getNetworkLogo(res.scheme) || BANK_PROFILES[knownKey].networkLogo,
              });
            } else {
              // Create dynamic profile for unknown banks
              setDetectedBank({
                key: "generic",
                name: res.bankName || "Unknown Bank",
                cardName: res.bankName || "Card",
                gradient: getGradientByScheme(res.scheme) || "linear-gradient(135deg, #1e293b, #0f172a)",
                textColor: "#FFFFFF",
                logo: null,
                networkLogo: getNetworkLogo(res.scheme),
                isGeneric: true
              });
            }
          } else {
            // Lookup returned no result, keep local match or fallback to generic scheme matching
            if (!localMatch) {
              const scheme = raw.startsWith("4") ? "visa" : /^(51|52|53|54|55)/.test(raw) ? "mastercard" : raw.startsWith("6") ? "gpn" : "";
              if (scheme) {
                setDetectedBank({
                  key: scheme,
                  ...BANK_PROFILES[scheme]
                });
              } else {
                setDetectedBank(null);
              }
            }
          }
        } catch (err) {
          console.error("BIN lookup failed:", err);
          if (active) {
            setError("Gagal melakukan pencarian BIN");
          }
        } finally {
          if (active) {
            setIsLoading(false);
          }
        }
      };

      fetchBIN();

      return () => {
        active = false;
      };
    } else {
      // If less than 6 digits, we only use the local prefix detection results
      if (!localMatch) {
        setDetectedBank(null);
      }
      setIsLoading(false);
    }
  }, [cardNumber]);

  return { isLoading, detectedBank, error };
}

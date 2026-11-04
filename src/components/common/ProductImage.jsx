import { useState } from "react";

const PLACEHOLDER_SRC = "/placeholder-product.svg";

export default function ProductImage({
  src,
  alt = "",
  className = "",
  onError: userOnError,
  ...restProps
}) {
  const [prevSrc, setPrevSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  // Reset error state during render if src prop changes (React recommended pattern)
  if (prevSrc !== src) {
    setPrevSrc(src);
    setHasError(false);
  }

  const isValidSrc = typeof src === "string" && src.trim() !== "";
  const currentSrc = !isValidSrc || hasError ? PLACEHOLDER_SRC : src;

  const handleError = (e) => {
    // Prevent infinite loop if the fallback itself fails or is already displayed
    if (!hasError && currentSrc !== PLACEHOLDER_SRC) {
      setHasError(true);
    }

    if (typeof userOnError === "function") {
      userOnError(e);
    }
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      {...restProps}
      onError={handleError}
    />
  );
}

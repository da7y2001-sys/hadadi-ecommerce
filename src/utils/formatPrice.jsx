/* eslint-disable react-refresh/only-export-components */
import RiyalSymbol from "../components/common/RiyalSymbol";

/**
 * Formats a raw number into a clean, comma-separated numeric string.
 */
export function formatNumber(value) {
  const number = Number(value);
  const valid = Number.isFinite(number) ? number : 0;
  return valid.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
}

/**
 * Centralized price formatter displaying the formatted amount followed by the
 * official SAMA Saudi Riyal vector symbol.
 */
export function formatPrice(value) {
  return (
    <span className="price-display">
      <span className="price-value">{formatNumber(value)}</span>
      <RiyalSymbol />
    </span>
  );
}

/**
 * Calculates the effective/discounted price of a product.
 * Uses exact 2-decimal rounding matching backend order calculation.
 */
export function getEffectivePrice(item) {
  const price = Number(item?.price) || 0;
  const discount = Number(item?.discount) || 0;

  if (discount > 0 && discount <= 100) {
    return Math.round(price * (1 - discount / 100) * 100) / 100;
  }

  return price;
}

export { RiyalSymbol };
export default formatPrice;

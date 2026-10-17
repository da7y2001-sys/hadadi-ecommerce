// تنسيق موحّد للأسعار في كل المتجر
const priceFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatPrice(value) {
  const number = Number(value);
  return priceFormatter.format(Number.isFinite(number) ? number : 0);
}

export default formatPrice;

// lib/utils.ts

export function formatCurrency(amount: number | null | undefined): string {
  if (amount == null) return "₹0";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0, // Removes decimal places (e.g., ₹15,000 instead of ₹15,000.00)
  }).format(amount);
}
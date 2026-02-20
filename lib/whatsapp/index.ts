/**
 * WhatsApp deep-link builder.
 *
 * Generates wa.me URLs for:
 *   - Single product purchase
 *   - Entire "Buy the Look" purchase
 *
 * The store's WhatsApp number is read from site config at build time,
 * but these helpers are client-safe (they only use NEXT_PUBLIC_ vars).
 */

export interface WhatsAppProductParams {
  productName: string;
  size: string;
  color: string;
  price: string;
  currencySymbol: string;
  productUrl: string;
}

export interface WhatsAppLookItem {
  productName: string;
  size: string;
  color: string;
  price: string;
}

export interface WhatsAppLookParams {
  lookName: string;
  items: WhatsAppLookItem[];
  totalPrice: string;
  currencySymbol: string;
  lookUrl: string;
}

/**
 * Build a WhatsApp deep-link for a single product.
 */
export function buildProductWhatsAppLink(
  phone: string,
  params: WhatsAppProductParams,
): string {
  const message = [
    `Hi! I'd like to order:`,
    ``,
    `🛍 *${params.productName}*`,
    `Size: ${params.size}  |  Color: ${params.color}`,
    `Price: ${params.currencySymbol}${params.price}`,
    ``,
    `Product link: ${params.productUrl}`,
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

/**
 * Build a WhatsApp deep-link for a "Buy the Look" outfit.
 * Lists all items with a combined total.
 */
export function buildLookWhatsAppLink(
  phone: string,
  params: WhatsAppLookParams,
): string {
  const itemLines = params.items
    .map(
      (item, i) =>
        `${i + 1}. *${item.productName}* — ${item.size} / ${item.color} (${params.currencySymbol}${item.price})`,
    )
    .join("\n");

  const message = [
    `Hi! I'd like to order a complete look:`,
    ``,
    `✨ *${params.lookName}*`,
    ``,
    itemLines,
    ``,
    `Total: *${params.currencySymbol}${params.totalPrice}*`,
    `Look link: ${params.lookUrl}`,
  ].join("\n");

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

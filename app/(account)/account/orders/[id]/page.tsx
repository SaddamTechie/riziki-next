import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowLeft,
  MapPin,
  CreditCard,
} from "lucide-react";
import type { Metadata } from "next";

type OrderStatus =
  | "pending"
  | "payment_pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

const STATUS_CONFIG: Record<
  OrderStatus,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ElementType;
  }
> = {
  pending: { label: "Pending", variant: "secondary", icon: Clock },
  payment_pending: {
    label: "Awaiting Payment",
    variant: "outline",
    icon: Clock,
  },
  confirmed: { label: "Confirmed", variant: "default", icon: CheckCircle2 },
  processing: { label: "Processing", variant: "default", icon: Package },
  shipped: { label: "Shipped", variant: "default", icon: Truck },
  delivered: { label: "Delivered", variant: "default", icon: CheckCircle2 },
  cancelled: { label: "Cancelled", variant: "destructive", icon: XCircle },
  refunded: { label: "Refunded", variant: "outline", icon: XCircle },
};

/** Timeline of status steps shown in order */
const STATUS_STEPS: OrderStatus[] = [
  "confirmed",
  "processing",
  "shipped",
  "delivered",
];

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  return { title: `Order ${id.slice(0, 8).toUpperCase()}` };
}

async function getOrder(orderId: string, userId: string) {
  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.id, orderId), eq(orders.userId, userId)))
    .limit(1);

  if (!order) return null;

  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return { ...order, items };
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect(`/sign-in?callbackUrl=/account/orders/${id}`);

  const order = await getOrder(id, session.user.id);
  if (!order) notFound();

  const status = order.status as OrderStatus;
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  const StatusIcon = cfg.icon;
  const currentStepIdx = STATUS_STEPS.indexOf(status);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Button variant="ghost" size="sm" className="-ml-2" asChild>
        <Link href="/account/orders">
          <ArrowLeft className="mr-2 h-4 w-4" />
          All orders
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-heading text-xl font-bold">
            Order {order.orderNumber}
          </h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString("en-KE", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <Badge variant={cfg.variant} className="gap-1.5">
          <StatusIcon className="h-3.5 w-3.5" />
          {cfg.label}
        </Badge>
      </div>

      {/* Progress tracker — only for non-cancelled/refunded orders */}
      {!["cancelled", "refunded", "pending", "payment_pending"].includes(
        status,
      ) && (
        <div className="rounded-xl border bg-card p-4">
          <div className="flex items-center gap-2">
            {STATUS_STEPS.map((step, i) => {
              const stepCfg = STATUS_CONFIG[step];
              const StepIcon = stepCfg.icon;
              const done = i <= currentStepIdx;
              const active = i === currentStepIdx;
              return (
                <div key={step} className="flex flex-1 items-center gap-2">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs transition-colors ${
                        done
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-muted bg-muted/50 text-muted-foreground"
                      } ${active ? "ring-2 ring-primary/30" : ""}`}
                    >
                      <StepIcon className="h-4 w-4" />
                    </div>
                    <span
                      className={`text-center text-xs ${done ? "font-medium text-foreground" : "text-muted-foreground"}`}
                    >
                      {stepCfg.label}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <div
                      className={`mb-5 h-0.5 flex-1 rounded ${
                        i < currentStepIdx ? "bg-primary" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left — items + totals */}
        <div className="space-y-4 lg:col-span-2">
          <div className="rounded-xl border bg-card overflow-hidden">
            <div className="border-b bg-muted/40 px-4 py-3">
              <p className="text-sm font-semibold">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="divide-y px-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-start gap-3 py-4">
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{item.productName}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Size: {item.variantSize} · Colour: {item.variantColor}
                      {item.sku && ` · SKU: ${item.sku}`}
                    </p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      Qty: {item.quantity} ×{" "}
                      {formatPrice(parseFloat(item.unitPrice), order.currency)}
                    </p>
                  </div>
                  <span className="whitespace-nowrap font-semibold">
                    {formatPrice(parseFloat(item.subtotal), order.currency)}
                  </span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <Separator />
            <div className="space-y-2 px-4 py-4 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>
                  {formatPrice(parseFloat(order.subtotal), order.currency)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>
                  {parseFloat(order.shippingCost) === 0
                    ? "Free"
                    : formatPrice(
                        parseFloat(order.shippingCost),
                        order.currency,
                      )}
                </span>
              </div>
              {parseFloat(order.discount) > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>
                    −{formatPrice(parseFloat(order.discount), order.currency)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-base font-bold">
                <span>Total</span>
                <span>
                  {formatPrice(parseFloat(order.total), order.currency)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right — shipping + payment */}
        <div className="space-y-4">
          {/* Shipping address */}
          {order.shippingName && (
            <div className="rounded-xl border bg-card p-4">
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                Shipping address
              </div>
              <address className="not-italic text-sm text-muted-foreground space-y-0.5">
                <p className="font-medium text-foreground">
                  {order.shippingName}
                </p>
                {order.shippingPhone && <p>{order.shippingPhone}</p>}
                {order.shippingAddress && <p>{order.shippingAddress}</p>}
                {order.shippingCity && (
                  <p>
                    {order.shippingCity}
                    {order.shippingCountry ? `, ${order.shippingCountry}` : ""}
                  </p>
                )}
              </address>
            </div>
          )}

          {/* Payment info */}
          <div className="rounded-xl border bg-card p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              Payment
            </div>
            <dl className="space-y-1 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Method</dt>
                <dd className="capitalize">{order.paymentProvider ?? "—"}</dd>
              </div>
              {order.paymentRef && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Reference</dt>
                  <dd className="font-mono text-xs">{order.paymentRef}</dd>
                </div>
              )}
              {order.paidAt && (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Paid on</dt>
                  <dd>
                    {new Date(order.paidAt).toLocaleDateString("en-KE", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="rounded-xl border bg-muted/40 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Order notes
              </p>
              <p className="text-sm">{order.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders, orderItems } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import {
  Package,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  ChevronRight,
} from "lucide-react";

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

export const metadata = { title: "My Orders" };

async function getOrders(userId: string) {
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.userId, userId))
    .orderBy(desc(orders.createdAt));

  const ordersWithItems = await Promise.all(
    rows.map(async (order) => {
      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, order.id));
      return { ...order, items };
    }),
  );

  return ordersWithItems;
}

export default async function OrdersPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) redirect("/sign-in?callbackUrl=/account/orders");

  const userOrders = await getOrders(session.user.id);

  return (
    <div>
      <h1 className="mb-6 font-heading text-xl font-bold">My Orders</h1>

      {userOrders.length === 0 ? (
        <div className="rounded-xl border bg-card p-12 text-center">
          <Package className="mx-auto mb-4 h-10 w-10 text-muted-foreground/30" />
          <p className="font-medium">No orders yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Your orders will appear here once you shop.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {userOrders.map((order) => {
            const status = order.status as OrderStatus;
            const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;

            return (
              <div
                key={order.id}
                className="rounded-xl border bg-card overflow-hidden"
              >
                {/* Order header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/40 px-4 py-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">
                      {order.orderNumber}
                    </span>
                    <Badge variant={cfg.variant} className="gap-1 text-xs">
                      <StatusIcon className="h-3 w-3" />
                      {cfg.label}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString("en-KE", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>

                {/* Order items */}
                <div className="divide-y px-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-start gap-3 py-3">
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium">
                          {item.productName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Size: {item.variantSize} · Colour: {item.variantColor}{" "}
                          · Qty: {item.quantity}
                        </p>
                      </div>
                      <span className="text-sm font-semibold whitespace-nowrap">
                        {formatPrice(
                          parseFloat(item.unitPrice) * item.quantity,
                          "KES",
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Order total */}
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-muted-foreground">Total</span>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold">
                      {formatPrice(parseFloat(order.total), order.currency)}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1 text-xs"
                      asChild
                    >
                      <Link href={`/account/orders/${order.id}`}>
                        Details <ChevronRight className="h-3 w-3" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

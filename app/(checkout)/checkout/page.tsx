"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/stores/cart.store";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { StorageImage } from "@/components/shared/storage-image";
import { formatPrice } from "@/lib/utils";
import { Loader2, CheckCircle2, ShieldCheck } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ShippingInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

type Step = "bag" | "shipping" | "payment" | "confirm";

const INITIAL_SHIPPING: ShippingInfo = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "Kenya",
};

// ─── Order summary sidebar ────────────────────────────────────────────────────

function OrderSummary() {
  const { items, subtotal } = useCartStore();
  const total = subtotal();
  const SHIPPING = total >= 5000 ? 0 : 350;

  return (
    <div className="rounded-xl border bg-card p-5 space-y-4">
      <h2 className="font-semibold">Order Summary</h2>
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.variantId} className="flex gap-3">
            <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-md bg-muted">
              <StorageImage
                src={item.imagePublicId}
                blurDataUrl={item.imageBlurDataUrl}
                alt={item.productName}
                fill
                className="object-cover"
                sizes="48px"
              />
              <span className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-[10px] font-bold text-background">
                {item.quantity}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="line-clamp-1 text-xs font-medium">
                {item.productName}
              </p>
              <p className="text-[11px] text-muted-foreground">
                {item.size} · {item.color}
              </p>
            </div>
            <span className="text-xs font-semibold whitespace-nowrap">
              {formatPrice(item.price * item.quantity, "KES")}
            </span>
          </div>
        ))}
      </div>

      <Separator />

      <div className="space-y-1.5 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span>{formatPrice(total, "KES")}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span>{SHIPPING === 0 ? "Free" : formatPrice(SHIPPING, "KES")}</span>
        </div>
        <Separator />
        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>{formatPrice(total + SHIPPING, "KES")}</span>
        </div>
      </div>

      {SHIPPING === 0 && (
        <p className="text-center text-xs text-green-600 dark:text-green-400">
          🎉 You qualify for free shipping!
        </p>
      )}
    </div>
  );
}

// ─── Step: Shipping ───────────────────────────────────────────────────────────

interface ShippingFormProps {
  value: ShippingInfo;
  onChange: (v: ShippingInfo) => void;
  onNext: () => void;
}

function ShippingForm({ value, onChange, onNext }: ShippingFormProps) {
  const fields: Array<{
    id: keyof ShippingInfo;
    label: string;
    type?: string;
    placeholder: string;
  }> = [
    { id: "name", label: "Full Name", placeholder: "Jane Doe" },
    {
      id: "email",
      label: "Email",
      type: "email",
      placeholder: "you@example.com",
    },
    {
      id: "phone",
      label: "Phone",
      type: "tel",
      placeholder: "+254 700 000 000",
    },
    {
      id: "address",
      label: "Street Address",
      placeholder: "123 Kenyatta Avenue",
    },
    { id: "city", label: "City / Town", placeholder: "Nairobi" },
    { id: "country", label: "Country", placeholder: "Kenya" },
  ];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onNext();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      {fields.map((f) => (
        <div key={f.id} className="space-y-1.5">
          <Label htmlFor={f.id}>{f.label}</Label>
          <Input
            id={f.id}
            type={f.type ?? "text"}
            value={value[f.id]}
            onChange={(e) => onChange({ ...value, [f.id]: e.target.value })}
            placeholder={f.placeholder}
            required
          />
        </div>
      ))}
      <Button type="submit" className="w-full">
        Continue to Payment
      </Button>
    </form>
  );
}

// ─── Step: Payment ────────────────────────────────────────────────────────────

interface PaymentStepProps {
  shipping: ShippingInfo;
  onPlaceOrder: () => void;
  loading: boolean;
}

function PaymentStep({ shipping, onPlaceOrder, loading }: PaymentStepProps) {
  const { subtotal } = useCartStore();
  const total = subtotal();
  const SHIPPING = total >= 5000 ? 0 : 350;

  return (
    <div className="space-y-4 pt-2">
      <div className="rounded-lg border bg-muted/40 p-3 text-sm">
        <p className="font-medium mb-1">Delivering to:</p>
        <p className="text-muted-foreground">
          {shipping.name} · {shipping.phone}
        </p>
        <p className="text-muted-foreground">
          {shipping.address}, {shipping.city}, {shipping.country}
        </p>
      </div>

      {/* M-Pesa STK push info */}
      <div className="rounded-lg border bg-emerald-50 dark:bg-emerald-950/30 p-4 space-y-2">
        <div className="flex items-center gap-2 font-medium text-sm">
          <span className="text-2xl">📱</span>
          Pay via M-Pesa
        </div>
        <p className="text-xs text-muted-foreground">
          Tap &ldquo;Place Order&rdquo; and you&apos;ll receive an M-Pesa STK
          push to <strong>{shipping.phone}</strong>. Enter your M-Pesa PIN to
          complete the payment of{" "}
          <strong>{formatPrice(total + SHIPPING, "KES")}</strong>.
        </p>
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 shrink-0 text-green-500" />
        Your payment is secured by Safaricom M-Pesa
      </div>

      <Button
        className="w-full"
        size="lg"
        onClick={onPlaceOrder}
        disabled={loading}
      >
        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Place Order — {formatPrice(total + SHIPPING, "KES")}
      </Button>
    </div>
  );
}

// ─── Main checkout page ───────────────────────────────────────────────────────

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const [step, setStep] = useState<Step>("shipping");
  const [shipping, setShipping] = useState<ShippingInfo>(INITIAL_SHIPPING);
  const [loading, setLoading] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [orderNumber, setOrderNumber] = useState("");

  async function handlePlaceOrder() {
    setLoading(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            variantId: i.variantId,
            quantity: i.quantity,
            unitPrice: i.price,
            productName: i.productName,
            variantSize: i.size,
            variantColor: i.color,
          })),
          shipping,
          paymentMethod: "mpesa",
        }),
        credentials: "include",
      });

      if (res.ok) {
        const data = await res.json();
        // Initiate M-Pesa STK push
        await fetch("/api/payments/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            orderId: data.id,
            phone: shipping.phone,
            amount: data.total,
          }),
          credentials: "include",
        });

        setOrderNumber(data.orderNumber ?? data.id);
        clearCart();
        setPlaced(true);
        toast.success(
          "Order placed! Check your M-Pesa for the payment prompt.",
        );
      } else {
        const err = await res.json().catch(() => ({}));
        toast.error(err?.message ?? "Failed to place order. Please try again.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (placed) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
        <div>
          <h1 className="font-heading text-2xl font-bold">Order Placed!</h1>
          <p className="mt-1 text-muted-foreground">
            Order <strong>{orderNumber}</strong> confirmed. Check your M-Pesa
            for the payment prompt.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/account/orders")}
          >
            View Orders
          </Button>
          <Button onClick={() => router.push("/")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    router.push("/products");
    return null;
  }

  return (
    <div className="mx-auto max-w-4xl py-8">
      <h1 className="mb-8 font-heading text-2xl font-bold">Checkout</h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        {/* Left: accordion steps */}
        <Accordion
          type="single"
          value={step}
          onValueChange={(v) => v && setStep(v as Step)}
          collapsible={false}
          className="w-full"
        >
          {/* Step 1: Your Bag */}
          <AccordionItem value="bag">
            <AccordionTrigger className="font-semibold">
              <span className="flex items-center gap-2">
                <Badge
                  variant={step === "bag" ? "default" : "secondary"}
                  className="h-5 w-5 justify-center p-0 text-xs"
                >
                  1
                </Badge>
                Your Bag
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-3 pt-2">
                {items.map((item) => (
                  <div key={item.variantId} className="flex gap-3 text-sm">
                    <div className="relative h-14 w-11 shrink-0 overflow-hidden rounded-md bg-muted">
                      <StorageImage
                        src={item.imagePublicId}
                        alt={item.productName}
                        fill
                        className="object-cover"
                        sizes="44px"
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.productName}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.size} · {item.color} · Qty {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold">
                      {formatPrice(item.price * item.quantity, "KES")}
                    </span>
                  </div>
                ))}
                <Button
                  className="mt-2 w-full"
                  onClick={() => setStep("shipping")}
                >
                  Continue to Shipping
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Step 2: Shipping */}
          <AccordionItem value="shipping">
            <AccordionTrigger className="font-semibold">
              <span className="flex items-center gap-2">
                <Badge
                  variant={
                    step === "shipping"
                      ? "default"
                      : step === "payment" || step === "confirm"
                        ? "secondary"
                        : "outline"
                  }
                  className="h-5 w-5 justify-center p-0 text-xs"
                >
                  2
                </Badge>
                Shipping
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <ShippingForm
                value={shipping}
                onChange={setShipping}
                onNext={() => setStep("payment")}
              />
            </AccordionContent>
          </AccordionItem>

          {/* Step 3: Payment */}
          <AccordionItem value="payment">
            <AccordionTrigger
              className="font-semibold"
              disabled={step === "bag" || step === "shipping"}
            >
              <span className="flex items-center gap-2">
                <Badge
                  variant={step === "payment" ? "default" : "outline"}
                  className="h-5 w-5 justify-center p-0 text-xs"
                >
                  3
                </Badge>
                Payment
              </span>
            </AccordionTrigger>
            <AccordionContent>
              <PaymentStep
                shipping={shipping}
                onPlaceOrder={handlePlaceOrder}
                loading={loading}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Right: order summary */}
        <div className="lg:sticky lg:top-24 h-fit">
          <OrderSummary />
        </div>
      </div>
    </div>
  );
}

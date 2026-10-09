"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { verifyPaymentAction } from "./actions";
import { CreditCard, Loader2, CheckCircle2, FileDown } from "lucide-react";

interface PayRentButtonProps {
  payment: {
    id: string;
    totalAmount: number;
    status: string;
  };
  user: {
    fullName: string | null;
    email: string;
    phone: string | null;
  };
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PayRentButton({ payment, user }: PayRentButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [paid, setPaid] = useState(payment.status === "PAID");

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setLoading(true);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert("Failed to load Razorpay payment engine. Please check your internet connection.");
        setLoading(false);
        return;
      }

      // 1. Create order on the backend
      const res = await fetch("/api/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId: payment.id }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Unable to initiate payment transaction.");
      }

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "NestFlow Co-Living",
        description: `Rent Invoice Settlement (#${payment.id.slice(-6)})`,
        order_id: data.orderId,
        prefill: {
          name: user.fullName || "Resident",
          email: user.email,
          contact: user.phone || "",
        },
        theme: {
          color: "#f97316", // NestFlow theme orange
        },
        handler: async function (response: any) {
          try {
            await verifyPaymentAction({
              paymentId: payment.id,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });

            setPaid(true);
            router.refresh();
          } catch (err: any) {
            console.error(err);
            alert("Payment signature verification failed. Please contact your property manager.");
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (err: any) {
      console.error(err);
      alert(err.message || "An unexpected checkout error occurred.");
    } finally {
      setLoading(false);
    }
  };

  // When paid: show Paid status badge AND the Invoice Download button
  if (paid) {
    return (
      <div className="flex items-center gap-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 text-xs font-black">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>Invoice Paid</span>
        </div>

        <a
          href={`/invoice/${payment.id}?auto=true`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white dark:bg-white/10 hover:bg-orange-50 dark:hover:bg-white/15 text-slate-800 dark:text-slate-200 hover:text-orange-600 dark:hover:text-rose-400 border border-orange-200/60 dark:border-white/15 text-xs font-black shadow-xs transition-all active:scale-95"
          title="Download Official Tax Invoice (PDF)"
        >
          <FileDown className="w-3.5 h-3.5 text-orange-500 dark:text-rose-400" />
          <span>Invoice</span>
        </a>
      </div>
    );
  }

  return (
    <button
      onClick={handlePayment}
      disabled={loading}
      className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xs transition shadow-sm hover:shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95"
    >
      {loading ? (
        <>
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
          <span>Opening Checkout...</span>
        </>
      ) : (
        <>
          <CreditCard className="w-3.5 h-3.5" />
          <span>Pay ₹{payment.totalAmount.toLocaleString("en-IN")}</span>
        </>
      )}
    </button>
  );
}
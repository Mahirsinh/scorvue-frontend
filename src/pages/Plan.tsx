// pages/Plan.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../app/store";
import { updateUserPlan } from "../features/auth/authSlice";
import { CheckCircleIcon, XCircleIcon, ArrowLeftIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { paymentApi } from "../services/paymentApi";
import { loadRazorpayScript } from "../utils/loadRazorpay";

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Plan = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const currentPlan = user?.plan || "free";

  const [processing, setProcessing] = useState(false);

  const freeFeatures = [
    { text: "1 AI mock interview", included: true },
    { text: "1 detailed report", included: true },
    { text: "Resume analyzer", included: true },
    { text: "Unlimited interview reports", included: false },
    { text: "Priority AI response time", included: false },
  ];

  const eliteFeatures = [
    { text: "Unlimited AI mock interviews", included: true },
    { text: "Unlimited detailed reports", included: true },
    { text: "Resume analyzer", included: true },
    { text: "Authenticity & confidence analytics", included: true },
    { text: "Priority AI response time", included: true },
  ];

  const handleUpgradeClick = async () => {
    setProcessing(true);
    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        toast.error("Failed to load payment gateway. Check your internet connection.");
        setProcessing(false);
        return;
      }

      const { data } = await paymentApi.createOrder();
      const { orderId, amount, currency, keyId } = data;

      const options = {
        key: keyId,
        amount,
        currency,
        order_id: orderId,
        name: "SCORVUE",
        description: "Elite Plan Upgrade",
        prefill: {
          name: user?.name || "",
          email: user?.email || "",
        },
        theme: { color: "#4f46e5" },
        handler: async (response: any) => {
          try {
            const verifyRes = await paymentApi.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            dispatch(updateUserPlan(verifyRes.data.plan));
            toast.success(verifyRes.data.message || "You're now on Elite! 🎉");
          } catch (err: any) {
            const msg = err.response?.data?.error?.message || "Payment verification failed";
            toast.error(msg);
          } finally {
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled");
            setProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err: any) {
      const msg = err.response?.data?.error?.message || "Could not start payment. Please try again.";
      toast.error(msg);
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <button
        onClick={() => navigate("/")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
      >
        <ArrowLeftIcon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Back to Dashboard</span>
      </button>

      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-gray-900">Choose Your Plan</h1>
        <p className="text-gray-500 mt-2">
          You've used your free interview report. Upgrade to Elite for unlimited access.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Free Plan */}
        <div
          className={`rounded-3xl border-2 p-8 ${
            currentPlan === "free" ? "border-blue-500 bg-blue-50/40" : "border-gray-200 bg-white"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900">Free</h2>
            {currentPlan === "free" && (
              <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                Current Plan
              </span>
            )}
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-6">
            ₹0<span className="text-sm font-normal text-gray-400">/month</span>
          </p>
          <ul className="space-y-3 mb-8">
            {freeFeatures.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                {f.included ? (
                  <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                ) : (
                  <XCircleIcon className="w-5 h-5 text-gray-300 flex-shrink-0" />
                )}
                <span className={f.included ? "text-gray-700" : "text-gray-400"}>{f.text}</span>
              </li>
            ))}
          </ul>
          <button
            disabled
            className="w-full py-3 rounded-xl bg-gray-100 text-gray-400 font-medium cursor-not-allowed"
          >
            {currentPlan === "free" ? "Your Current Plan" : "Free Plan"}
          </button>
        </div>

        {/* Elite Plan */}
        <div className="rounded-3xl border-2 border-indigo-500 bg-gradient-to-br from-indigo-50 to-blue-50 p-8 relative overflow-hidden">
          <div className="absolute top-4 right-4">
            <span className="text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-blue-600 px-3 py-1 rounded-full flex items-center gap-1">
              <SparklesIcon className="w-3 h-3" />
              Recommended
            </span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Elite</h2>
          <p className="text-3xl font-bold text-gray-900 mb-6">
            ₹199<span className="text-sm font-normal text-gray-400">/month</span>
          </p>
          <ul className="space-y-3 mb-8">
            {eliteFeatures.map((f, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                <CheckCircleIcon className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                <span className="text-gray-700">{f.text}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={handleUpgradeClick}
            disabled={currentPlan === "elite" || processing}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-bold shadow-lg shadow-indigo-500/30 hover:shadow-xl transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            {currentPlan === "elite"
              ? "You're on Elite"
              : processing
              ? "Processing..."
              : "Upgrade to Elite"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Plan;
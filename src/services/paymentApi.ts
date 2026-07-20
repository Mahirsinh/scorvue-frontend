// services/paymentApi.ts
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface CreateOrderResponse {
  success: boolean;
  data: {
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
  };
}

export interface VerifyPaymentPayload {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

export interface VerifyPaymentResponse {
  success: boolean;
  data: {
    plan: string;
    message: string;
  };
}

export const paymentApi = {
  createOrder: async (): Promise<CreateOrderResponse> => {
    const response = await axios.post(
      `${API_URL}/payment/create-order`,
      {},
      { withCredentials: true }
    );
    return response.data;
  },

  verifyPayment: async (payload: VerifyPaymentPayload): Promise<VerifyPaymentResponse> => {
    const response = await axios.post(
      `${API_URL}/payment/verify`,
      payload,
      { withCredentials: true }
    );
    return response.data;
  },
};

export default paymentApi;
import { useState } from "react";
import { paymobApi } from "../utils/paymob";

export const usePaymob = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initPayment = async (apiKey: string, orderData: object, keyData: object) => {
    try {
      setLoading(true);
      const token = await paymobApi.authenticate(apiKey);
      const order = await paymobApi.createOrder(token, orderData);
      const paymentKey = await paymobApi.getPaymentKey(token, keyData);
      return { token, order, paymentKey };
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { initPayment, loading, error };
};

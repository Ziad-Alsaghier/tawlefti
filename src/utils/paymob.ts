import axios from "axios";

const API_URL = "https://accept.paymob.com/api";

export const paymobApi = {
  authenticate: async (apiKey: string) => {
    const res = await axios.post(`${API_URL}/auth/tokens`, { api_key: apiKey });
    return res.data.token;
  },

  createOrder: async (token: string, orderData: object) => {
    const res = await axios.post(`${API_URL}/ecommerce/orders`, orderData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
  },

  getPaymentKey: async (token: string, keyData: object) => {
    const res = await axios.post(`${API_URL}/acceptance/payment_keys`, keyData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data.token;
  },
};

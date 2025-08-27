import React, { useState } from "react";
import axios from "axios";

const PaymobCardPay = ({ totalAmount }) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1️⃣ Authenticate
      const auth = await axios.post("https://accept.paymob.com/api/auth/tokens", {
        api_key: "ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNklrcFhWQ0o5LmV5SmpiR0Z6Y3lJNklrMWxjbU5vWVc1MElpd2ljSEp2Wm1sc1pWOXdheUk2TVRBd05EQXlPU3dpYm1GdFpTSTZJbWx1YVhScFlXd2lmUS5LZ2VpUVZrMUxPb0NyQnVja2IwUDVCTWRlY1JRTC1BMnlINS1lV2o2Nm5PUGdPNmZrSHhmX2VVUDN2enczbF9rWmtJTzZBNFoySEk0RFpLYWhFbUhRQQ=="
      });
      const token = auth.data.token;

      // 2️⃣ Create order
      const order = await axios.post("https://accept.paymob.com/api/ecommerce/orders", {
        auth_token: token,
        amount_cents: (totalAmount * 100).toString(), // multiply EGP by 100 to get cents
        currency: "EGP",
        delivery_needed: "false",
        items: []
      });
      const orderId = order.data.id;

      // 3️⃣ Get payment key
      const paymentKey = await axios.post("https://accept.paymob.com/api/acceptance/payment_keys", {
        auth_token: token,
        amount_cents: (totalAmount * 100).toString(),
        expiration: 3600,
        order_id: orderId,
        billing_data: {
          apartment: "NA",
          email: "customer@example.com",
          floor: "NA",
          first_name: "John",
          last_name: "Doe",
          street: "NA",
          building: "NA",
          phone_number: "+201000000000",
          shipping_method: "NA",
          postal_code: "NA",
          city: "Cairo",
          country: "EG",
          state: "NA"
        },
        currency: "EGP",
        integration_id: "4867465"
      });

      const iframeToken = paymentKey.data.token;

      // 4️⃣ Redirect to iframe
      window.location.href = `https://accept.paymob.com/api/acceptance/iframes/878812?payment_token=${iframeToken}`;

    } catch (err) {
      console.error(err);
      alert("Payment failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="bg-blue-600 text-white px-4 py-2 rounded-md"
      onClick={handlePayment}
      disabled={loading}
    >
      {loading ? "Processing..." : `Pay ${totalAmount} EGP`}
    </button>
  );
};

export default PaymobCardPay;

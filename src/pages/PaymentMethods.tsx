import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import PayButton from "@/components/paymob/PayButton";
import { useCart } from "@/contexts/CartContext";

type PaymentMethod = {
  id: string;
  name: string;
  image: string;
};

export default function PaymentMethods() {
  const [selected, setSelected] = useState<string | null>(null);
  const navigate = useNavigate();
  const cart = useCart();

  const methods: PaymentMethod[] = [
    {
      id: "card",
      name: "Credit / Debit Card",
      image: "src/images/payments/card.png", // 🖼️ place images in /public/images/payments
    },
    {
      id: "wallet",
      name: "E-Wallet",
      image: "/src/images/payments/wallet.png",
    },
    {
      id: "mobile",
      name: "Mobile Payment",
      image: "/src/images/payments/mobile.png",
    },
    {
      id: "cod",
      name: "Cash on Delivery",
      image: "/src/images/payments/cod.png",
    },
    {
      id: "paymob",
      name: "Paymob",
      image: "/src/images/payments/paymob.png",
    },
  ];

  const handleSelect = (methodId: string) => {
    setSelected((prev) => (prev === methodId ? null : methodId)); // toggle
  };

  const handleProceed = () => {
    if (selected === "paymob") {
      return; // Paymob handled directly
    }

    if (selected) {
      navigate(`/pay/${selected}`);
    } else {
      alert("Please select a payment method");
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-3xl shadow-xl rounded-3xl">
        <CardContent className="p-8">
          <h1 className="text-3xl font-extrabold text-center mb-8 text-gray-800 dark:text-gray-100">
            Choose Your Payment Method
          </h1>

          {/* Grid of methods */}
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {methods.map((method) => (
              <div
                key={method.id}
                onClick={() => handleSelect(method.id)}
                className={`relative cursor-pointer rounded-2xl border p-4 flex flex-col items-center transition-transform hover:scale-105 hover:shadow-lg ${
                  selected === method.id
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-900/30"
                    : "border-gray-200 bg-white dark:bg-gray-800"
                }`}
              >
                <img
                  src={method.image}
                  alt={method.name}
                  className="w-20 h-20 object-contain mb-4"
                />
                <span className="font-medium text-center">{method.name}</span>

                {selected === method.id && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-blue-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>

          {/* Action button */}
          <div className="mt-8 text-center">
            {selected === "paymob" ? (
              <PayButton totalAmount={cart.total.toString()} />
            ) : (
              <Button
                onClick={handleProceed}
                className="px-8 py-3 rounded-2xl text-lg"
                disabled={!selected}
              >
                Proceed to Pay
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

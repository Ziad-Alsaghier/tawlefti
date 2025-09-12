// src/pages/PaymentDetails.jsx
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function PaymentDetails() {
  const { method } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md shadow-lg">
        <CardContent className="p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Pay with {method}</h2>
          <p className="text-gray-600 mb-4">
            Here you can integrate the actual payment flow for <b>{method}</b>.
          </p>
          <Button onClick={() => navigate(-1)} className="rounded-2xl">
            Go Back
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

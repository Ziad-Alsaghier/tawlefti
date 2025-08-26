import { useForm } from "react-hook-form";
import { usePaymob } from "../hooks/usePaymob";

export const PaymentForm = () => {
  const { register, handleSubmit } = useForm();
  const { initPayment, loading, error } = usePaymob();

  const onSubmit = async (data: any) => {
    const result = await initPayment(
      "YOUR_API_KEY",
      { amount_cents: data.amount * 100, currency: "EGP" },
      { amount_cents: data.amount * 100, currency: "EGP" }
    );
    console.log("Payment initialized:", result);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="p-4">
      <input {...register("amount")} placeholder="Enter Amount" className="border p-2 mb-2" />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2">
        {loading ? "Processing..." : "Use Paymob"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
};

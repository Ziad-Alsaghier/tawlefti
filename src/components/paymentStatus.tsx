import { useLocation } from "react-router-dom";

export const PaymentStatus = () => {
  const { search } = useLocation();
  const query = new URLSearchParams(search);
  const status = query.get("status");

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold">Payment {status === "success" ? "Successful ✅" : "Failed ❌"}</h2>
    </div>
  );
};

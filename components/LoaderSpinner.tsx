import { Loader2 } from "lucide-react";

// components/LoadingSpinner.tsx
export const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-screen">
  <Loader2 className="animate-spin h-12 w-12 text-primary" />
</div>
  );
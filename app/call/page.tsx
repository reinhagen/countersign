"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import App from "@/components/App";

function CallPageInner() {
  const searchParams = useSearchParams();
  const autoPlayDemo = searchParams.get("demo") === "1";
  return <App autoPlayDemo={autoPlayDemo} />;
}

export default function CallPage() {
  return (
    <Suspense fallback={null}>
      <CallPageInner />
    </Suspense>
  );
}

import type { Metadata } from "next";
import PartnershipsPage from "@/components/workspace/PartnershipsPage";

export const metadata: Metadata = {
  title: "Partnerships",
};

export default function Page() {
  return <PartnershipsPage />;
}

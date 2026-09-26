import type { Metadata } from "next";
import CommitmentsPage from "@/components/workspace/CommitmentsPage";

export const metadata: Metadata = {
  title: "Commitments",
};

export default function Page() {
  return <CommitmentsPage />;
}

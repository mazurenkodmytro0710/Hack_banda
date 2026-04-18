import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function DashboardEntryPage() {
  const session = await getSession();

  if (!session) {
    redirect("/auth/login");
  }

  redirect(session.role === "REQUESTER" ? "/dashboard/requester" : "/dashboard/helper");
}

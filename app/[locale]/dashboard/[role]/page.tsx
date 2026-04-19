import { notFound, redirect } from "next/navigation";

export default function LocalizedDashboardRolePage({
  params,
}: {
  params: { role: string };
}) {
  if (params.role !== "requester" && params.role !== "helper") {
    notFound();
  }

  redirect(`/dashboard/${params.role}`);
}

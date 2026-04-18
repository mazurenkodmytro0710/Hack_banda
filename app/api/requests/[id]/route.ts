import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import { HelpRequest } from "@/models/Request";
import { User } from "@/models/User";
import { serializeRequest } from "@/lib/serializers";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  await connectDB();
  const r = await HelpRequest.findById(params.id);
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const requester = await User.findById(r.requester_id).select("_id name karma_points level").exec();
  return NextResponse.json({
    request: {
      ...serializeRequest(r),
      requester_name: requester?.name ?? "Anonymous",
      requester_karma: requester?.karma_points ?? 0,
    },
  });
}

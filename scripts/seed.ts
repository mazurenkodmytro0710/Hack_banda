import "dotenv/config";
import { connectDB } from "@/lib/mongodb";
import { ensureSeedData } from "@/lib/seed";

async function main() {
  await connectDB();
  await ensureSeedData();
}

void main().catch((error) => {
  throw error;
});

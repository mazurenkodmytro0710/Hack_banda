import { SAFE_NODE_SEED } from "./constants";
import { SafeNode } from "@/models/SafeNode";

export async function ensureSeedData(): Promise<void> {
  const existingSafeNodes = await SafeNode.countDocuments();
  if (existingSafeNodes > 0) {
    return;
  }

  await SafeNode.insertMany(SAFE_NODE_SEED);
}

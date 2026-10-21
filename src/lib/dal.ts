// Data Access Layer for the Owner Console: every console read and mutation goes through requireOwner().
import "server-only";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireOwner() {
  // Session checks are always request-time; keep them out of prefetch prerenders.
  await connection();
  const session = await auth();
  if (!session?.user?.tenantId) redirect("/console/login");
  return { userId: session.user.id, tenantId: session.user.tenantId, email: session.user.email ?? "" };
}

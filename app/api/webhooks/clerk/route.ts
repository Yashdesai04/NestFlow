import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { Role } from "@prisma/client";

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    return new Response(
      "Error: Missing SIGNING_SECRET in environment variables.",
      { status: 500 }
    );
  }

  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix verification headers.", {
      status: 400,
    });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(SIGNING_SECRET);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(body, {
  "svix-id": svix_id,
  "svix-timestamp": svix_timestamp,
  "svix-signature": svix_signature,
}) as unknown as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook signature:", err);
    return new Response("Error: Verification error.", { status: 400 });
  }

  const eventType = evt.type;

  if (eventType === "user.created" || eventType === "user.updated") {
    const { id, email_addresses, first_name, last_name, image_url, phone_numbers, public_metadata } = evt.data;

    const primaryEmail = email_addresses?.find(
      (e) => e.id === evt.data.primary_email_address_id
    )?.email_address || email_addresses?.[0]?.email_address;

    if (!primaryEmail) {
      return new Response("Error: No email provided in Clerk payload.", {
        status: 400,
      });
    }

    const fullName = [first_name, last_name].filter(Boolean).join(" ") || null;
    const phone = phone_numbers?.[0]?.phone_number || null;

    // Read initial role from Clerk public metadata if set, default to TENANT
    const rawRole = (public_metadata?.role as string)?.toUpperCase();
    const assignedRole: Role = rawRole === "LANDLORD" || rawRole === "ADMIN" ? (rawRole as Role) : "TENANT";

    await db.user.upsert({
      where: { clerkId: id },
      update: {
        email: primaryEmail,
        fullName,
        phone,
        avatarUrl: image_url || null,
        ...(public_metadata?.role ? { role: assignedRole } : {}),
      },
      create: {
        clerkId: id,
        email: primaryEmail,
        fullName,
        phone,
        avatarUrl: image_url || null,
        role: assignedRole,
      },
    });

    return new Response("User synchronized successfully.", { status: 200 });
  }

  if (eventType === "user.deleted") {
    const { id } = evt.data;
    if (id) {
      await db.user.deleteMany({
        where: { clerkId: id },
      });
    }
    return new Response("User deleted successfully.", { status: 200 });
  }

  return new Response("Webhook received.", { status: 200 });
}
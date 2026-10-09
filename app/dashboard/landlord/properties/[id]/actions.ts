"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

// Helper to verify landlord ownership of property
async function verifyPropertyOwner(propertyId: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkId: userId } });
  if (!user) throw new Error("User record not found");

  const property = await db.property.findFirst({
    where: { id: propertyId, landlordId: user.id },
  });

  if (!property) throw new Error("Property not found or access denied");
  return { user, property };
}

// 1. Add Room to Property
export async function addRoom(formData: FormData) {
  const propertyId = formData.get("propertyId") as string;
  const roomNumber = (formData.get("roomNumber") as string)?.trim();
  const roomType = (formData.get("roomType") as string)?.trim();

  if (!propertyId || !roomNumber) throw new Error("Missing required fields");

  await verifyPropertyOwner(propertyId);

  await db.room.create({
    data: {
      propertyId,
      roomNumber,
      roomType,
    },
  });

  revalidatePath(`/dashboard/landlord/properties/${propertyId}`);
  revalidatePath(`/properties/${propertyId}`);
}

// 2. Delete Room from Property
export async function deleteRoom(propertyId: string, roomId: string) {
  await verifyPropertyOwner(propertyId);

  await db.room.delete({
    where: { id: roomId },
  });

  revalidatePath(`/dashboard/landlord/properties/${propertyId}`);
  revalidatePath(`/properties/${propertyId}`);
}

// 3. Add Bed to Room
export async function addBed(formData: FormData) {
  const propertyId = formData.get("propertyId") as string;
  const roomId = formData.get("roomId") as string;
  const bedNumber = (formData.get("bedNumber") as string)?.trim();
  const priceMonthly = parseFloat(formData.get("priceMonthly") as string) || null;

  if (!propertyId || !roomId || !bedNumber) throw new Error("Missing required fields");

  await verifyPropertyOwner(propertyId);

  await db.bed.create({
    data: {
      roomId,
      bedNumber,
      priceMonthly,
      status: "VACANT",
    },
  });

  revalidatePath(`/dashboard/landlord/properties/${propertyId}`);
  revalidatePath(`/properties/${propertyId}`);
}

// 4. Delete Bed from Room
export async function deleteBed(propertyId: string, bedId: string) {
  await verifyPropertyOwner(propertyId);

  await db.bed.delete({
    where: { id: bedId },
  });

  revalidatePath(`/dashboard/landlord/properties/${propertyId}`);
  revalidatePath(`/properties/${propertyId}`);
}

// 5. Add / Update Property Photo URLs
export async function addPropertyImages(formData: FormData) {
  const propertyId = formData.get("propertyId") as string;
  const { property } = await verifyPropertyOwner(propertyId);

  const newImagesRaw = (formData.get("images") as string) || "";
  const newImages = newImagesRaw
    .split(",")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);

  if (newImages.length === 0) return;

  // ✅ Fallback to empty array if property.images is null or undefined in PostgreSQL
  const currentImages = property.images || [];
  const updatedImages = Array.from(new Set([...currentImages, ...newImages]));

  await db.property.update({
    where: { id: propertyId },
    data: { images: updatedImages },
  });

  revalidatePath(`/dashboard/landlord/properties/${propertyId}`);
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath(`/properties`);
}

// 6. Delete a single photo from property
export async function deletePropertyImage(
  propertyId: string,
  imageUrlToDelete: string
) {
  const { property } = await verifyPropertyOwner(propertyId);

  // ✅ Fallback to empty array if property.images is null or undefined
  const currentImages = property.images || [];
  const updatedImages = currentImages.filter((img) => img !== imageUrlToDelete);

  await db.property.update({
    where: { id: propertyId },
    data: { images: updatedImages },
  });

  revalidatePath(`/dashboard/landlord/properties/${propertyId}`);
  revalidatePath(`/properties/${propertyId}`);
  revalidatePath(`/properties`);
}
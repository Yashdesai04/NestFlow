"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { PropertyType, GenderPolicy, TargetAudience, LeasingType } from "@prisma/client";

export async function createPropertyAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) redirect("/login");

  const landlord = await db.user.findUnique({
    where: { clerkId: userId },
  });

  if (!landlord || landlord.role !== "LANDLORD") {
    throw new Error("Only registered landlords can list properties.");
  }

  const title = (formData.get("title") as string)?.trim();
  const description = (formData.get("description") as string)?.trim() || null;
  const propertyType = formData.get("propertyType") as PropertyType;
  const genderPolicy = (formData.get("genderPolicy") as GenderPolicy) || "CO_ED";
  const targetAudience = (formData.get("targetAudience") as TargetAudience) || "ALL";

  // Assign leasing type based on property category
  const isBedLevel = propertyType === "PG" || propertyType === "HOSTEL";
  const leasingType: LeasingType = isBedLevel ? "BED_LEVEL" : "FULL_UNIT";

  const address = (formData.get("address") as string)?.trim();
  const city = (formData.get("city") as string)?.trim();
  const state = (formData.get("state") as string)?.trim();
  const zipCode = (formData.get("zipCode") as string)?.trim();
  const priceMonthlyRaw = formData.get("priceMonthly") as string;
  const securityDepositRaw = formData.get("securityDeposit") as string;
  const imageUrlRaw = (formData.get("imageUrl") as string)?.trim();
  const amenitiesRaw = formData.getAll("amenities") as string[];
  const roomsJson = (formData.get("roomsJson") as string) || "[]";

  if (!title || !propertyType || !address || !city || !state || !zipCode) {
    throw new Error("Please fill in all required fields.");
  }

  const priceMonthly = priceMonthlyRaw ? parseFloat(priceMonthlyRaw) : null;
  const securityDeposit = securityDepositRaw ? parseFloat(securityDepositRaw) : null;
  const images = imageUrlRaw ? [imageUrlRaw] : [];

  let parsedRooms: Array<{
    roomNumber: string;
    roomType?: string;
    bedsCount: number | string;
    bedPrice?: number | string;
  }> = [];

  try {
    parsedRooms = JSON.parse(roomsJson);
  } catch {
    parsedRooms = [];
  }

  const newProperty = await db.$transaction(async (tx) => {
    const property = await tx.property.create({
      data: {
        landlordId: landlord.id,
        title,
        description,
        propertyType,
        genderPolicy,
        targetAudience,
        leasingType,
        address,
        city,
        state,
        zipCode,
        priceMonthly,
        securityDeposit,
        images,
        amenities: amenitiesRaw,
      },
    });

    if (isBedLevel) {
      for (const r of parsedRooms) {
        if (!r.roomNumber) continue;

        const room = await tx.room.create({
          data: {
            propertyId: property.id,
            roomNumber: r.roomNumber.trim(),
            roomType: r.roomType?.trim() || `${r.bedsCount} Sharing`,
          },
        });

        const bedsCount = Number(r.bedsCount) || 1;
        const parsedBedPrice = r.bedPrice ? parseFloat(String(r.bedPrice)) : priceMonthly;

        for (let i = 1; i <= bedsCount; i++) {
          await tx.bed.create({
            data: {
              roomId: room.id,
              bedNumber: `B${i}`,
              priceMonthly: parsedBedPrice,
              status: "VACANT",
            },
          });
        }
      }
    } else {
      // Full-Unit Leasing: creates a single master unit
      const unitRoom = await tx.room.create({
        data: {
          propertyId: property.id,
          roomNumber: "Unit 1",
          roomType:
            propertyType === "FLAT"
              ? "Full Apartment"
              : propertyType === "OFFICE"
              ? "Commercial Unit"
              : "Independent House",
        },
      });

      await tx.bed.create({
        data: {
          roomId: unitRoom.id,
          bedNumber: "Entire Unit",
          priceMonthly: priceMonthly,
          status: "VACANT",
        },
      });
    }

    return property;
  });

  revalidatePath("/dashboard/landlord");
  revalidatePath("/dashboard/landlord/operations");
  revalidatePath("/properties");
  redirect(`/properties/${newProperty.id}`);
}
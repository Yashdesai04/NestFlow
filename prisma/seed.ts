import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import {
  PrismaClient,
  Role,
  PropertyType,
  GenderPolicy,
  TargetAudience,
  LeasingType,
  BedStatus,
  KycStatus,
} from "@prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set in your .env file.");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding NestFlow database...");

  // 1. Create a Seed Landlord User
  const landlord = await prisma.user.upsert({
    where: { email: "landlord@nestflow.internal" },
    update: {},
    create: {
      clerkId: "user_seed_landlord_001",
      email: "landlord@nestflow.internal",
      fullName: "Vikram Mehta",
      phone: "+91 98765 43210",
      role: Role.LANDLORD,
      isVerified: true,
      kycStatus: KycStatus.APPROVED,
    },
  });

  // 2. Create a Seed Tenant User
  const tenant = await prisma.user.upsert({
    where: { email: "tenant@nestflow.internal" },
    update: {},
    create: {
      clerkId: "user_seed_tenant_001",
      email: "tenant@nestflow.internal",
      fullName: "Rohan Patel",
      phone: "+91 91234 56789",
      role: Role.TENANT,
      isVerified: true,
      kycStatus: KycStatus.APPROVED,
    },
  });

  // 3. Create a Verified Demo Property
  let property = await prisma.property.findFirst({
    where: { landlordId: landlord.id, title: "NestFlow Urban Living PG" },
  });

  if (!property) {
    property = await prisma.property.create({
      data: {
        landlordId: landlord.id,
        title: "NestFlow Urban Living PG",
        description:
          "Premium co-living property with high-speed WiFi, daily meals, and 24/7 security.",
        propertyType: PropertyType.PG,
        genderPolicy: GenderPolicy.CO_ED,
        targetAudience: TargetAudience.WORKING_PROFESSIONALS,
        leasingType: LeasingType.BED_LEVEL,
        address: "Plot 42, Skyline Boulevard, Tech Park Road",
        city: "Bengaluru",
        state: "Karnataka",
        zipCode: "560100",
        priceMonthly: 12000,
        securityDeposit: 24000,
        isVerified: true,
        isFeatured: true,
        amenities: [
          "High-Speed Wi-Fi",
          "Daily Housekeeping",
          "3-Time Meals",
          "Air Conditioning",
          "Biometric Access",
        ],
        images: [
          "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?auto=format&fit=crop&w=1200&q=80",
        ],
      },
    });
  }

  // 4. Create Rooms & Beds
  const existingRooms = await prisma.room.findMany({
    where: { propertyId: property.id },
  });

  if (existingRooms.length === 0) {
    // Room 101: Double Sharing
    const room101 = await prisma.room.create({
      data: {
        propertyId: property.id,
        roomNumber: "101",
        roomType: "Double Sharing",
      },
    });

    const bedA = await prisma.bed.create({
      data: {
        roomId: room101.id,
        bedNumber: "A",
        priceMonthly: 12000,
        status: BedStatus.OCCUPIED,
      },
    });

    await prisma.bed.create({
      data: {
        roomId: room101.id,
        bedNumber: "B",
        priceMonthly: 12000,
        status: BedStatus.VACANT,
      },
    });

    // Room 102: Single Private
    const room102 = await prisma.room.create({
      data: {
        propertyId: property.id,
        roomNumber: "102",
        roomType: "Single Private",
      },
    });

    await prisma.bed.create({
      data: {
        roomId: room102.id,
        bedNumber: "A",
        priceMonthly: 18000,
        status: BedStatus.VACANT,
      },
    });

    // 5. Create an Active Lease for Bed 101-A
    const existingLease = await prisma.lease.findFirst({
      where: { tenantId: tenant.id, propertyId: property.id },
    });

    if (!existingLease) {
      const startDate = new Date();
      startDate.setDate(1);

      const lease = await prisma.lease.create({
        data: {
          tenantId: tenant.id,
          propertyId: property.id,
          roomId: room101.id,
          bedId: bedA.id,
          startDate,
          rentAmount: 12000,
          depositAmount: 24000,
          status: "ACTIVE",
          isSigned: true,
          termsAccepted: true,
          signedAt: new Date(),
        },
      });

      // 6. Create Initial Invoice
      await prisma.payment.create({
        data: {
          leaseId: lease.id,
          tenantId: tenant.id,
          rentAmount: 12000,
          utilityAmount: 500,
          totalAmount: 12500,
          dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 5),
          status: "PENDING",
        },
      });
    }
  }

  console.log("✅ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
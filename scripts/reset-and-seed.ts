import mongoose from "mongoose";
import config from "../src/app/config";
import { clearDatabase, seedAll } from "../src/app/DB";

async function main() {
  const dbUri = config.DATABASE_URL;
  if (!dbUri) {
    console.error("❌ No DATABASE_URL found in configuration or environment.");
    process.exit(1);
  }

  console.log("🔗 Connecting to MongoDB...");
  await mongoose.connect(dbUri);
  console.log("✅ Connected successfully.");

  console.log("🧹 Clearing all database collections...");
  await clearDatabase();

  console.log("🌱 Running seed functions with fresh data...");
  await seedAll();

  console.log("\n📊 Verification of seeded collections:");
  const collections = await mongoose.connection.db!.listCollections().toArray();
  for (const col of collections) {
    const count = await mongoose.connection.db!.collection(col.name).countDocuments();
    if (count > 0) {
      console.log(`  ✓ ${col.name}: ${count} document(s)`);
    }
  }

  await mongoose.disconnect();
  console.log("\n✨ Database reset and fresh seeding completed successfully!");
}

main().catch((err) => {
  console.error("💥 Error during database reset and seeding:", err);
  process.exit(1);
});

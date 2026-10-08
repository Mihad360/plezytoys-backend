const mongoose = require('mongoose');
require('dotenv').config({ path: 'C:/projects/plezytoys-backend/.env' });

async function run() {
  await mongoose.connect(process.env.DATABASE_URL);
  console.log('Connected to DB');

  const updateDemo = await mongoose.connection.db.collection('companies').updateOne(
    { name: 'ShiftPoint Demo Company' },
    { $set: { contactEmail: 'company_admin@shiftpoint.com', businessEmail: 'company_admin@shiftpoint.com' } }
  );
  console.log('ShiftPoint Demo Company updated:', updateDemo.modifiedCount);

  const updateApex = await mongoose.connection.db.collection('companies').updateOne(
    { name: 'Apex Security BV' },
    { $set: { contactEmail: 'admin@apexsecurity.nl', businessEmail: 'admin@apexsecurity.nl' } }
  );
  console.log('Apex Security BV updated:', updateApex.modifiedCount);

  const companies = await mongoose.connection.db.collection('companies').find({}).toArray();
  console.log('Current companies in DB:');
  companies.forEach(c => {
    console.log(`- ${c.name}: contactEmail=${c.contactEmail}, businessEmail=${c.businessEmail}`);
  });

  await mongoose.disconnect();
}

run().catch(console.error);

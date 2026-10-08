const mongoose = require('mongoose');
require('dotenv').config({ path: 'C:/projects/plezytoys-backend/.env' });

async function run() {
  await mongoose.connect(process.env.DATABASE_URL);
  console.log('Connected to DB');

  const userId = new mongoose.Types.ObjectId('6ac1e47e140fe4d80d7946a7');
  const companyId = new mongoose.Types.ObjectId('6ac1e47c140fe4d80d7946a4');
  const locId = new mongoose.Types.ObjectId('6ac5d3b472cd040854d47652');
  const mgrId = new mongoose.Types.ObjectId('6ac1e47d140fe4d80d7946a6');

  // Assign location to employee
  await mongoose.connection.db.collection('users').updateOne(
    { _id: userId },
    { $set: { assignedLocations: [locId], assignedLocation: locId, biometricEnabled: false } }
  );

  // Set up shift for today
  const today = new Date();
  today.setHours(8, 0, 0, 0);

  await mongoose.connection.db.collection('shifts').deleteMany({ user: userId });
  await mongoose.connection.db.collection('shifts').insertOne({
    user: userId,
    company: companyId,
    location: locId,
    date: today,
    startTime: '08:00',
    endTime: '16:00',
    status: 'upcoming',
    manager: mgrId,
    notes: 'Morning Shift 08:00 — 16:00',
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Clear any existing active sessions so user starts "Not clocked in"
  await mongoose.connection.db.collection('worksessions').deleteMany({ user: userId });

  console.log('Daan Vermeer demo data ready: location assigned, today shift created, active sessions reset.');
  await mongoose.disconnect();
}

run().catch(console.error);

const mongoose = require('mongoose');
require('dotenv').config({ path: 'C:/projects/plezytoys-backend/.env' });

async function run() {
  await mongoose.connect(process.env.DATABASE_URL);
  const locId = new mongoose.Types.ObjectId('6ac5d3b472cd040854d47652');
  await mongoose.connection.db.collection('tasks').updateOne(
    { _id: new mongoose.Types.ObjectId('6ac1ec49ae216fcf3188a8ef') },
    {
      $set: {
        location: locId,
        title: 'Inspect Emergency Exit Fire Extinguishers',
        description: 'Verify pressure gauge, inspection seals, and clear pathway at Sector C emergency exits.',
        priority: 'high',
        status: 'pending',
        checklist: [
          { _id: new mongoose.Types.ObjectId(), title: 'Check pressure gauge needle is in green zone', isCompleted: false },
          { _id: new mongoose.Types.ObjectId(), title: 'Verify safety seal and tamper indicator intact', isCompleted: false },
          { _id: new mongoose.Types.ObjectId(), title: 'Ensure unobstructed access to emergency exit doors', isCompleted: false }
        ]
      }
    }
  );
  console.log('Task successfully updated');
  await mongoose.disconnect();
}
run();

import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../config/db';
import { User } from '../models/User';
import { Site } from '../models/Site';
import { TimeSlot } from '../models/TimeSlot';
import { Reservation } from '../models/Reservation';

async function seed() {
  await connectDB();

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Site.deleteMany({}),
    TimeSlot.deleteMany({}),
    Reservation.deleteMany({}),
  ]);

  // Create admin + demo user
  const [admin, user] = await User.create([
    { name: 'Admin User', email: 'admin@heritage.com', password: 'Admin@1234', role: 'admin' },
    { name: 'Demo User', email: 'user@heritage.com', password: 'User@1234', role: 'user' },
  ]);

  console.log('Users created:', admin!.email, user!.email);

  // Create 3 cultural sites
  const sites = await Site.create([
    {
      name: 'Amber Fort',
      description: 'A majestic fort overlooking Maota Lake, known for its blend of Rajput and Mughal architecture.',
      location: 'Amer, Jaipur, Rajasthan',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/97/Amber_Fort_Jaipur_2.jpg/1280px-Amber_Fort_Jaipur_2.jpg',
      maxDailyCapacity: 500,
    },
    {
      name: 'Qutub Minar Complex',
      description: 'UNESCO World Heritage Site featuring the iconic 73-meter minaret built in 1193.',
      location: 'Mehrauli, New Delhi',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Qutb_Minar_2015.jpg/800px-Qutb_Minar_2015.jpg',
      maxDailyCapacity: 800,
    },
    {
      name: 'Ellora Caves',
      description: 'Rock-cut cave temples representing Buddhist, Hindu, and Jain art from 600-1000 CE.',
      location: 'Aurangabad, Maharashtra',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/Ellora_cave_32.jpg/1280px-Ellora_cave_32.jpg',
      maxDailyCapacity: 600,
    },
  ]);

  console.log('Sites created:', sites.map((s) => s.name).join(', '));

  // Create time slots for each site for the next 7 days
  const slotDefs = [
    { startTime: '09:00', endTime: '10:30' },
    { startTime: '11:00', endTime: '12:30' },
    { startTime: '14:00', endTime: '15:30' },
    { startTime: '16:00', endTime: '17:30' },
  ];

  const slotDocs: Array<{
    site: mongoose.Types.ObjectId;
    date: Date;
    startTime: string;
    endTime: string;
    totalCapacity: number;
    available_tickets: number;
  }> = [];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (const site of sites) {
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + d);
      const capacity = Math.floor(site.maxDailyCapacity / slotDefs.length);
      for (const { startTime, endTime } of slotDefs) {
        slotDocs.push({
          site: site._id,
          date,
          startTime,
          endTime,
          totalCapacity: capacity,
          available_tickets: capacity,
        });
      }
    }
  }

  await TimeSlot.insertMany(slotDocs);
  console.log(`Created ${slotDocs.length} time slots across ${sites.length} sites for 7 days`);
  console.log('\n=== Seed complete ===');
  console.log('Admin login: admin@heritage.com / Admin@1234');
  console.log('User  login: user@heritage.com  / User@1234');

  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});

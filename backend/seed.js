require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
const Event = require('./models/Event');
const Rsvp = require('./models/Rsvp');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');

    // Clear existing data
    await User.deleteMany({});
    await Event.deleteMany({});
    await Rsvp.deleteMany({});

    // Create users
    const adminPass = await bcrypt.hash('admin123', 10);
    const userPass = await bcrypt.hash('user123', 10);

    const admin = new User({
      name: 'Admin',
      email: 'admin@example.com',
      password: adminPass,
      role: 'admin',
    });

    const user = new User({
      name: 'User',
      email: 'user@example.com',
      password: userPass,
      role: 'user',
    });

    await admin.save();
    await user.save();

    // Create events
    const eventsData = [
      {
        title: 'Community Meetup',
        description: 'Local community meetup and networking',
        date: new Date('2025-10-05T18:00:00'),
        startTime: '18:00',
        endTime: '20:00',
        location: 'Community Hall',
        createdBy: admin._id
      },
      {
        title: 'Tech Talk: Node.js',
        description: 'Intro to Node.js',
        date: new Date('2025-10-12T15:00:00'),
        startTime: '15:00',
        endTime: '17:00',
        location: 'Online - Zoom',
        createdBy: admin._id
      },
      {
        title: 'Charity Run',
        description: '5K run for charity',
        date: new Date('2025-11-01T06:00:00'),
        startTime: '06:00',
        endTime: '09:00',
        location: 'City Stadium',
        createdBy: user._id
      }
    ];

    const events = await Event.insertMany(eventsData);

    console.log('Seed complete');
    process.exit(0);
  } catch (err) {
    console.error('Seed error:', err);
    process.exit(1);
  }
}

seed();

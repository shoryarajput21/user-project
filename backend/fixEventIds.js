const mongoose = require('mongoose');
require('dotenv').config();
const Rsvp = require('./models/Rsvp');

async function fixEventIds() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const rsvps = await Rsvp.find({});
    for (const rsvp of rsvps) {
      if (!(rsvp.eventId instanceof mongoose.Types.ObjectId)) {
        rsvp.eventId = mongoose.Types.ObjectId(rsvp.eventId);
        await rsvp.save();
        console.log(`Fixed RSVP ${rsvp._id}`);
      }
    }

    console.log('All eventIds fixed!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

fixEventIds();

require('dotenv').config();
const mongoose = require('mongoose');

const Rsvp = require('./models/Rsvp'); // your Rsvp model

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    const rsvps = await Rsvp.find();

    for (let r of rsvps) {
      let updated = false;
      if (typeof r.eventId === 'string') {
        r.eventId = mongoose.Types.ObjectId(r.eventId);
        updated = true;
      }
      if (typeof r.userId === 'string') {
        r.userId = mongoose.Types.ObjectId(r.userId);
        updated = true;
      }
      if (updated) await r.save();
    }

    console.log('All RSVPs converted to ObjectId!');
    mongoose.disconnect();
  })
  .catch(err => { console.error(err); mongoose.disconnect(); });

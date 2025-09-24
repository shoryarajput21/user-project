


const mongoose = require('mongoose');

const RsvpSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { type: String, enum: ['going', 'maybe', 'decline'], required: true },
}, { timestamps: true });

module.exports = mongoose.model('Rsvp', RsvpSchema);

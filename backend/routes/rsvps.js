const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { authenticate , requireAdmin } = require('../middleware/auth');
const Rsvp = require('../models/Rsvp');
const Event = require('../models/Event');

// Create or update RSVP
router.post('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id;
    const { eventId, status } = req.body;
    if (!eventId || !status) return res.status(400).json({ message: 'eventId and status required' });

    // check event exists and date
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const eventDate = new Date(event.date);
    const today = new Date();
    if (today > eventDate) return res.status(400).json({ message: 'Cannot RSVP after event date' });

    // Convert IDs properly
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const eventObjectId = new mongoose.Types.ObjectId(eventId);

    // find existing RSVP
    let rsvp = await Rsvp.findOne({ userId: userObjectId, eventId: eventObjectId });

    if (rsvp) {
      rsvp.status = status;
      rsvp.updatedAt = new Date();
      await rsvp.save();
    } else {
      rsvp = new Rsvp({
        userId: userObjectId,
        eventId: eventObjectId,
        status
      });
      await rsvp.save();
    }

    res.json(rsvp);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
// Get my RSVPs
router.get('/me', authenticate, async (req, res) => {
  try {
    const userObjectId = new mongoose.Types.ObjectId(req.user.id);

    const rsvps = await Rsvp.find({ userId: userObjectId })
      .populate({
        path: 'eventId',
        select: 'title date'
      })
      .sort({ 'eventId.date': 1 });

    const result = rsvps.map(r => ({
      id: r._id,
      status: r.status,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
      event: {
        id: r.eventId._id,
        title: r.eventId.title,
        date: r.eventId.date
      }
    }));

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Get my RSVPs
router.get('/:id/summary', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // check eventId is valid
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    // count RSVPs grouped by status
    const rsvps = await Rsvp.aggregate([
      { $match: { eventId: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // default summary values
    const summary = { going: 0, maybe: 0, decline: 0 };

    // fill the summary with real counts
    rsvps.forEach(r => {
      const key = (r._id || "").toLowerCase().trim();
      if (summary.hasOwnProperty(key)) {
        summary[key] = r.count;
      }
    });

    res.json(summary);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
module.exports = router;

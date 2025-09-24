const express = require('express');
const router = express.Router();
const { authenticate, requireAdmin } = require('../middleware/auth');
const Event = require('../models/Event');
const Rsvp = require('../models/Rsvp');
const mongoose = require('mongoose'); 
// create event (admin)
router.post('/', authenticate, requireAdmin, async (req, res) => {
  try {
    const { title, description, date, startTime, endTime, location } = req.body;
    if (!title || !date) return res.status(400).json({ message: 'Title and date required' });

    const event = new Event({
      title,
      description: description || '',
      date,
      startTime: startTime || '',
      endTime: endTime || '',
      location: location || '',
      createdBy: req.user.id
    });

    await event.save();
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// update event (admin)
router.put('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, startTime, endTime, location } = req.body;

    const event = await Event.findByIdAndUpdate(
      id,
      {
        title,
        description: description || '',
        date,
        startTime: startTime || '',
        endTime: endTime || '',
        location: location || ''
      },
      { new: true }
    );

    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// delete event (admin)
router.delete('/:id', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await Event.findByIdAndDelete(id);
    res.json({ message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// list upcoming events sorted by date
router.get('/', async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1, startTime: 1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// get event details
router.get('/:id', async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// admin: RSVP summary
router.get('/:id/summary', authenticate, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid event ID' });
    }

    const eventObjectId = new mongoose.Types.ObjectId(id);

    const rsvps = await Rsvp.aggregate([
      { $match: { eventId: eventObjectId } },
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    // default values
    const summary = { going: 0, maybe: 0, decline: 0 };

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

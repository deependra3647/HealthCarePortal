const express = require('express');
const Appointment = require('../models/Appointment');
const { auth, adminOnly } = require('../middleware/auth');

const VALID_STATUSES = ['scheduled', 'completed', 'cancelled'];

const router = express.Router();
router.use(auth);

const populateOpts = [
  { path: 'patient', select: 'name phone' },
  { path: 'doctor', select: 'name specialization' },
];

router.get('/', async (req, res) => {
  const appointments = await Appointment.find()
    .populate('patient', 'name phone')
    .populate('doctor', 'name specialization')
    .sort({ date: 1 });
  res.json(appointments);
});

router.get('/:id', async (req, res) => {
  const appointment = await Appointment.findById(req.params.id)
    .populate('patient')
    .populate('doctor');
  if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
  res.json(appointment);
});

router.post('/', async (req, res) => {
  try {
    const appointment = await Appointment.create(req.body);
    await appointment.populate(['patient', 'doctor']);
    res.status(201).json(appointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.patch('/:id/status', adminOnly, async (req, res) => {
  const { status } = req.body;
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ message: 'Status must be scheduled, completed, or cancelled' });
  }
  try {
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    ).populate(populateOpts);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const updates = { ...req.body };
  if (updates.status !== undefined && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Only admins can change appointment status' });
  }
  if (updates.status !== undefined && !VALID_STATUSES.includes(updates.status)) {
    return res.status(400).json({ message: 'Status must be scheduled, completed, or cancelled' });
  }
  try {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    }).populate(populateOpts);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(appointment);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const appointment = await Appointment.findByIdAndDelete(req.params.id);
  if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
  res.json({ message: 'Appointment deleted' });
});

module.exports = router;

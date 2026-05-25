const express = require('express');
const Doctor = require('../models/Doctor');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  const filter = {};
  const specialization = req.query.specialization?.trim();
  if (specialization) {
    filter.specialization = { $regex: specialization, $options: 'i' };
  }
  const doctors = await Doctor.find(filter).sort({ name: 1 });
  res.json(doctors);
});

router.get('/:id', async (req, res) => {
  const doctor = await Doctor.findById(req.params.id);
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  res.json(doctor);
});

router.post('/', async (req, res) => {
  try {
    const doctor = await Doctor.create(req.body);
    res.status(201).json(doctor);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  res.json(doctor);
});

router.delete('/:id', async (req, res) => {
  const doctor = await Doctor.findByIdAndDelete(req.params.id);
  if (!doctor) return res.status(404).json({ message: 'Doctor not found' });
  res.json({ message: 'Doctor deleted' });
});

module.exports = router;

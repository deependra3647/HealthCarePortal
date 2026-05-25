const express = require('express');
const Patient = require('../models/Patient');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/', async (req, res) => {
  const filter = {};
  const name = req.query.name?.trim();
  if (name) {
    filter.name = { $regex: name, $options: 'i' };
  }
  const patients = await Patient.find(filter).sort({ createdAt: -1 });
  res.json(patients);
});

router.get('/:id', async (req, res) => {
  const patient = await Patient.findById(req.params.id);
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json(patient);
});

router.post('/', async (req, res) => {
  try {
    const patient = await Patient.create(req.body);
    res.status(201).json(patient);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const patient = await Patient.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json(patient);
});

router.delete('/:id', async (req, res) => {
  const patient = await Patient.findByIdAndDelete(req.params.id);
  if (!patient) return res.status(404).json({ message: 'Patient not found' });
  res.json({ message: 'Patient deleted' });
});

module.exports = router;

const express = require('express');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const { auth } = require('../middleware/auth');

const router = express.Router();
router.use(auth);

router.get('/stats', async (req, res) => {
  const [patients, doctors, appointments, scheduled] = await Promise.all([
    Patient.countDocuments(),
    Doctor.countDocuments(),
    Appointment.countDocuments(),
    Appointment.countDocuments({ status: 'scheduled' }),
  ]);
  res.json({ patients, doctors, appointments, scheduled });
});

module.exports = router;

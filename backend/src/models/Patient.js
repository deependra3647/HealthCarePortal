const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    address: { type: String },
    bloodGroup: { type: String },
    medicalHistory: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Patient', patientSchema);

const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, required: true },
    specialization: { type: String, required: true },
    department: { type: String },
    availableDays: [{ type: String }],
    consultationFee: { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);

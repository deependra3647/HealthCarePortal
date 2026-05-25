require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

const seed = async () => {
  await connectDB();
  await Promise.all([
    User.deleteMany(),
    Patient.deleteMany(),
    Doctor.deleteMany(),
    Appointment.deleteMany(),
  ]);

  await User.create({
    name: 'Deependra Kansana',
    email: 'deependrakansana2004@gmail.com',
    password: 'Deep@3647',
    role: 'admin',
  });

  const patients = await Patient.insertMany([
    {
      name: 'Arjun Sharma',
      email: 'arjun.sharma@gmail.com',
      phone: '+91 98765 43210',
      gender: 'male',
      bloodGroup: 'B+',
      address: 'Sector 12, Rohini, New Delhi',
    },
    {
      name: 'Priya Patel',
      email: 'priya.patel@gmail.com',
      phone: '+91 91234 56789',
      gender: 'female',
      bloodGroup: 'O+',
      address: 'Ashram Road, Ahmedabad, Gujarat',
    },
    {
      name: 'Rahul Verma',
      email: 'rahul.verma@gmail.com',
      phone: '+91 99887 76655',
      gender: 'male',
      bloodGroup: 'A+',
      address: 'Gomti Nagar, Lucknow, Uttar Pradesh',
    },
    {
      name: 'Kavya Nair',
      email: 'kavya.nair@gmail.com',
      phone: '+91 98470 12345',
      gender: 'female',
      bloodGroup: 'AB+',
      address: 'MG Road, Kochi, Kerala',
    },
  ]);

  const doctors = await Doctor.insertMany([
    {
      name: 'Dr. Ananya Iyer',
      email: 'ananya.iyer@hospital.in',
      phone: '+91 98760 11101',
      specialization: 'Cardiology',
      department: 'Heart & Vascular Centre',
      availableDays: ['Mon', 'Wed', 'Fri'],
      consultationFee: 800,
    },
    {
      name: 'Dr. Vikram Singh',
      email: 'vikram.singh@hospital.in',
      phone: '+91 98760 11102',
      specialization: 'Pediatrics',
      department: 'Bal Chikitsa (Children Ward)',
      availableDays: ['Tue', 'Thu', 'Sat'],
      consultationFee: 600,
    },
    {
      name: 'Dr. Meera Reddy',
      email: 'meera.reddy@hospital.in',
      phone: '+91 98760 11103',
      specialization: 'General Medicine',
      department: 'OPD Block A',
      availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      consultationFee: 500,
    },
    {
      name: 'Dr. Rohan Desai',
      email: 'rohan.desai@hospital.in',
      phone: '+91 98760 11104',
      specialization: 'Orthopedics',
      department: 'Bone & Joint Care',
      availableDays: ['Wed', 'Thu', 'Sat'],
      consultationFee: 750,
    },
  ]);

  await Appointment.insertMany([
    {
      patient: patients[0]._id,
      doctor: doctors[0]._id,
      date: new Date(Date.now() + 86400000),
      time: '10:00',
      status: 'scheduled',
      notes: 'Routine cardiac checkup',
    },
    {
      patient: patients[1]._id,
      doctor: doctors[1]._id,
      date: new Date(Date.now() + 172800000),
      time: '11:30',
      status: 'scheduled',
      notes: 'Child wellness visit',
    },
    {
      patient: patients[2]._id,
      doctor: doctors[2]._id,
      date: new Date(Date.now() - 86400000),
      time: '09:00',
      status: 'completed',
      notes: 'Fever and follow-up',
    },
  ]);

  console.log('Seed complete');
  console.log('Admin login: deependrakansana2004@gmail.com');
  process.exit(0);
};

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

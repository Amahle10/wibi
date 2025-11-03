import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const driverSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  carModel: { type: String },
  carPlate: { type: String },
driverLicense: { type: String, required: true, unique: true },
  idNumber: { type: String },
  planType: { type: String, default: 'subscription' }, // subscription/free
  status: { type: String, default: 'active' }, // active/suspended
  currentStatus: { type: String, default: 'offline' }, // online/offline
  ridesCompleted: { type: Number, default: 0 },
  averageRating: { type: Number, default: 0 },
  cancellations: { type: Number, default: 0 },
  totalEarnings: { type: Number, default: 0 },
  totalCommissionPaid: { type: Number, default: 0 },
}, { timestamps: true });

// ---------------------
// Hash password before save
// ---------------------
driverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// ---------------------
// Methods
// ---------------------
driverSchema.methods.isSubscriptionActive = function () {
  // Placeholder logic
  return this.planType !== 'subscription' || true;
};

driverSchema.methods.canAcceptRides = function () {
  return this.status === 'active';
};

driverSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model('Driver', driverSchema);

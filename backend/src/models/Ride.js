import mongoose from 'mongoose';

const RideSchema = new mongoose.Schema({
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  origin: { type: String, required: true },
  destination: { type: String, required: true },
  status: { type: String, enum: ['requested', 'accepted', 'completed', 'cancelled'], default: 'requested' }
}, { timestamps: true });

export default mongoose.model('Ride', RideSchema);

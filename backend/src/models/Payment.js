import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  type: {
    type: String,
    enum: ['subscription', 'commission', 'payout'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  // For subscription payments
  subscriptionPeriod: {
    start: Date,
    end: Date
  },
  // For commission payments
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ride'
  },
  rideFare: Number,
  commissionRate: Number,
  // For all payment types
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'card', 'cash'],
    required: true
  },
  transactionId: String,
  notes: String,
  processedAt: Date,
  failureReason: String
}, {
  timestamps: true
});

// Indexes for frequent queries
paymentSchema.index({ driverId: 1, type: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ 'subscriptionPeriod.end': 1 }, { 
  sparse: true // Only index documents that have this field
});

// Calculate commission amount before saving
paymentSchema.pre('save', function(next) {
  if (this.type === 'commission' && this.rideFare && this.commissionRate) {
    this.amount = (this.rideFare * this.commissionRate);
  }
  next();
});

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
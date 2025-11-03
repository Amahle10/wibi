import mongoose from 'mongoose';

const settingsSchema = new mongoose.Schema({
  commissionRate: {
    type: Number,
    required: true,
    min: 0,
    max: 1,
    default: 0.15 // 15%
  },
  subscriptionFee: {
    monthly: {
      type: Number,
      required: true,
      default: 200 // R200
    },
    currency: {
      type: String,
      default: 'ZAR'
    }
  },
  minFare: {
    type: Number,
    required: true,
    default: 50 // R50 minimum fare
  },
  fareCalculation: {
    baseRate: {
      type: Number,
      required: true,
      default: 20 // Base fare R20
    },
    perKilometer: {
      type: Number,
      required: true,
      default: 10 // R10 per km
    },
    perMinute: {
      type: Number,
      required: true,
      default: 2 // R2 per minute
    },
    surgeMultiplierMax: {
      type: Number,
      required: true,
      default: 3 // Maximum 3x surge pricing
    }
  },
  payoutSettings: {
    minimumPayout: {
      type: Number,
      required: true,
      default: 500 // Minimum R500 for payout
    },
    payoutSchedule: {
      type: String,
      enum: ['daily', 'weekly', 'biweekly', 'monthly'],
      default: 'weekly'
    },
    autoPayouts: {
      type: Boolean,
      default: true
    }
  },
  // Singleton enforcement - only one settings document should exist
  isActive: {
    type: Boolean,
    default: true,
    required: true
  }
}, {
  timestamps: true
});

// Ensure only one active settings document exists
settingsSchema.pre('save', async function(next) {
  if (this.isActive) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { $set: { isActive: false } }
    );
  }
  next();
});

// Static method to get active settings
settingsSchema.statics.getActive = async function() {
  let settings = await this.findOne({ isActive: true });
  if (!settings) {
    settings = await this.create({}); // Create with defaults
  }
  return settings;
};

const Settings = mongoose.model('Settings', settingsSchema);

export default Settings;
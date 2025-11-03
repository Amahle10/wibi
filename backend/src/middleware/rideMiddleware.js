import Ride from '../models/Ride.js';

// Validate ride belongs to driver
export const validateRideOwnership = async (req, res, next) => {
  try {
    const { rideId } = req.params;
    const driverId = req.driver.id;

    const ride = await Ride.findById(rideId);
    if (!ride) {
      return res.status(404).json({ message: 'Ride not found' });
    }

    if (ride.driverId.toString() !== driverId) {
      return res.status(403).json({ message: 'Not authorized for this ride' });
    }

    // Add ride to request for use in next middleware/controller
    req.ride = ride;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Ride validation failed' });
  }
};

// Validate ride can be modified (not completed/cancelled)
export const validateRideStatus = async (req, res, next) => {
  const ride = req.ride;
  
  if (!['pending', 'started'].includes(ride.status)) {
    return res.status(400).json({
      message: 'Ride cannot be modified',
      status: ride.status
    });
  }

  next();
};

// Calculate and attach fare to request
export const calculateFare = async (req, res, next) => {
  try {
    const { distance, duration } = req.body;
    const settings = await Settings.getActive();
    
    const fare = {
      breakdown: {
        baseFare: settings.fareCalculation.baseRate,
        distance: (distance.value / 1000) * settings.fareCalculation.perKilometer,
        time: (duration.value / 60) * settings.fareCalculation.perMinute
      }
    };

    fare.amount = Object.values(fare.breakdown).reduce((sum, val) => sum + val, 0);
    
    // Apply minimum fare if needed
    if (fare.amount < settings.minFare) {
      fare.amount = settings.minFare;
      fare.breakdown.adjustment = settings.minFare - fare.amount;
    }

    req.calculatedFare = fare;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Fare calculation failed' });
  }
};
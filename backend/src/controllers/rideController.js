import Ride from '../models/Ride.js';

export async function createRide(req, res) {
  try {
    const { origin, destination, passenger, driver } = req.body;
    const ride = new Ride({ origin, destination, passenger, driver });
    await ride.save();
    res.json(ride);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
}

export async function listRidesForUser(req, res) {
  try {
    const rides = await Ride.find({ $or: [{ passenger: req.user.id }, { driver: req.user.id }] }).sort('-createdAt');
    res.json(rides);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
}

export async function updateRideStatus(req, res) {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ msg: 'Not found' });
    const { status } = req.body;
    ride.status = status || ride.status;
    await ride.save();
    res.json(ride);
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
}

export default { createRide, listRidesForUser, updateRideStatus };

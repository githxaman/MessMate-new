import Feedback from '../models/Feedback.js';

export const createFeedback = async (req, res) => {
  try {
    const { rating, foodQuality, taste, quantity, cleanliness, service, comment, mealType } =
      req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: 'Rating (1-5) is required' });
    }

    const feedback = await Feedback.create({
      userId: req.user._id,
      firebaseUid: req.firebaseUid,
      rating,
      foodQuality,
      taste,
      quantity,
      cleanliness,
      service,
      comment,
      mealType: mealType || 'general',
    });

    res.status(201).json({ message: 'Feedback submitted', feedback });
  } catch (error) {
    res.status(500).json({ message: 'Failed to submit feedback', error: error.message });
  }
};

export const getFeedback = async (req, res) => {
  try {
    const filter = req.user.role === 'student' ? { firebaseUid: req.firebaseUid } : {};
    const feedback = await Feedback.find(filter)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({ feedback });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch feedback', error: error.message });
  }
};

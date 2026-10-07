import mongoose from 'mongoose';
import Menu from '../models/Menu.js';

const startOfDay = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const endOfDay = (dateStr) => {
  const d = dateStr ? new Date(dateStr) : new Date();
  d.setHours(23, 59, 59, 999);
  return d;
};

export const getMenus = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ message: 'MongoDB is unavailable. Menus require the database.' });
    }
    const { date, week, published } = req.query;
    const filter = {};
    if (req.user?.role === 'student' || published === 'true') filter.isPublished = true;
    if (date) filter.date = { $gte: startOfDay(date), $lte: endOfDay(date) };
    if (week === 'true') {
      const start = startOfDay(req.query.startDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      filter.date = { $gte: start, $lte: end };
    }
    const menus = await Menu.find(filter).sort({ date: 1, mealType: 1 }).limit(100);
    return res.json({ menus });
  } catch (error) {
    res.status(500).json({ message: 'Failed to load menus', error: error.message });
  }
};

export const createMenu = async (req, res) => {
  try {
    const { date, day, mealType, items, mealCategory, description, isPublished } = req.body;
    if (!date || !mealType || !items?.length) {
      return res.status(400).json({ message: 'Date, meal type, and items are required' });
    }

    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'MongoDB is unavailable.' });
    const menu = await Menu.create({
      date: startOfDay(date),
      day: day || new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
      mealType,
      items,
      mealCategory,
      description,
      isPublished: !!isPublished,
      createdBy: req.user._id,
    });
    return res.status(201).json({ message: 'Menu created', menu });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create menu', error: error.message });
  }
};

export const updateMenu = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'MongoDB is unavailable.' });
    const { items, date, day, mealType, mealCategory, description, isPublished } = req.body;
    const updates = {};
    if (items) updates.items = items;
    if (date) updates.date = startOfDay(date);
    if (day) updates.day = day;
    if (mealType) updates.mealType = mealType;
    if (mealCategory) updates.mealCategory = mealCategory;
    if (description !== undefined) updates.description = description;
    if (isPublished !== undefined) updates.isPublished = !!isPublished;
    const menu = await Menu.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!menu) return res.status(404).json({ message: 'Menu not found' });
    return res.json({ message: 'Menu updated', menu });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update menu', error: error.message });
  }
};

export const deleteMenu = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'MongoDB is unavailable.' });
    const menu = await Menu.findByIdAndDelete(req.params.id);
    if (!menu) return res.status(404).json({ message: 'Menu not found' });
    return res.json({ message: 'Menu deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete menu', error: error.message });
  }
};

export const publishMenu = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) return res.status(503).json({ message: 'MongoDB is unavailable.' });
    const menu = await Menu.findByIdAndUpdate(req.params.id, { isPublished: !!req.body.isPublished }, { new: true });
    if (!menu) return res.status(404).json({ message: 'Menu not found' });
    return res.json({ message: menu.isPublished ? 'Menu published' : 'Menu unpublished', menu });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to publish menu', error: error.message });
  }
};

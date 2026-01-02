const express = require('express');
const router = express.Router();
const YouTube = require('../../models/YouTube');

function getYouTubeId(url) {
  try {
    const m = String(url).match(/(?:v=|youtu\.be\/|embed\/)([A-Za-z0-9_-]{11})/);
    return m ? m[1] : null;
  } catch (_) {
    return null;
  }
}

function withThumbnail(item) {
  const obj = item.toObject ? item.toObject() : item;
  const vid = getYouTubeId(obj.link);
  return {
    ...obj,
    thumbnail: vid ? `https://img.youtube.com/vi/${vid}/hqdefault.jpg` : null
  };
}

// Get all unique categories
router.get('/category', async (req, res) => {
  try {
    const categories = await YouTube.distinct('category');
    // Filter out null, undefined, and empty strings
    const validCategories = categories.filter(cat => cat && cat.trim() !== '');
    res.json({ success: true, data: validCategories });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// List all videos
router.get('/', async (req, res) => {
  try {
    const items = await YouTube.find().sort({ createdAt: -1 });
    res.json({ success: true, data: items.map(withThumbnail) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Create a video
router.post('/', async (req, res) => {
  try {
    const { title, link, category } = req.body;
    if (!title || !link) return res.status(400).json({ success: false, error: 'title and link are required' });
    const created = await YouTube.create({ title, link, category });
    res.json({ success: true, data: withThumbnail(created) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get a video
router.get('/:id', async (req, res) => {
  try {
    const item = await YouTube.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: withThumbnail(item) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Update a video
router.put('/:id', async (req, res) => {
  try {
    const { title, link, category } = req.body;
    const updated = await YouTube.findByIdAndUpdate(req.params.id, { title, link, category }, { new: true });
    if (!updated) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, data: withThumbnail(updated) });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Delete a video
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await YouTube.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, error: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;



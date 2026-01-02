const express = require('express');
const router = express.Router();
const SavedKundli = require('../../models/SavedKundli');

// Save a new kundli
router.post('/', async (req, res) => {
  try {
    const { userId, name, dateOfBirth, timeOfBirth, place, gender } = req.body;

    // Validate required fields
    if (!userId || !name || !dateOfBirth || !timeOfBirth || !place || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields. Please provide: userId, name, dateOfBirth, timeOfBirth, place, and gender'
      });
    }

    // Validate gender
    if (!['male', 'female', 'other'].includes(gender.toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid gender. Must be one of: male, female, other'
      });
    }

    // Create new saved kundli
    const savedKundli = new SavedKundli({
      userId,
      name,
      dateOfBirth: new Date(dateOfBirth),
      timeOfBirth,
      place,
      gender: gender.toLowerCase()
    });

    await savedKundli.save();

    res.status(201).json({
      success: true,
      message: 'Kundli saved successfully',
      data: savedKundli
    });

  } catch (error) {
    console.error('Error saving kundli:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get all saved kundlis for a specific user
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const savedKundlis = await SavedKundli.find({ userId })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      message: 'Saved kundlis retrieved successfully',
      data: savedKundlis,
      count: savedKundlis.length
    });

  } catch (error) {
    console.error('Error fetching saved kundlis:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get all saved kundlis (for admin) - Must be before /:id route
router.get('/all', async (req, res) => {
  try {
    const { page = 1, limit = 20, userId, search } = req.query;

    const query = {};

    // Filter by userId if provided
    if (userId) {
      query.userId = userId;
    }

    // Search by name or place
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { place: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (page - 1) * limit;

    const savedKundlis = await SavedKundli.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await SavedKundli.countDocuments(query);

    res.json({
      success: true,
      message: 'All saved kundlis retrieved successfully',
      data: savedKundlis,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalKundlis: total,
        hasNext: skip + savedKundlis.length < total,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching all saved kundlis:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Get a specific saved kundli by ID - Must be last to avoid conflicts
router.get('/:id', async (req, res) => {
  try {
    const savedKundli = await SavedKundli.findById(req.params.id);

    if (!savedKundli) {
      return res.status(404).json({
        success: false,
        message: 'Saved kundli not found'
      });
    }

    res.json({
      success: true,
      message: 'Saved kundli retrieved successfully',
      data: savedKundli
    });

  } catch (error) {
    console.error('Error fetching saved kundli:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Update a saved kundli
router.put('/:id', async (req, res) => {
  try {
    const { name, dateOfBirth, timeOfBirth, place, gender } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);
    if (timeOfBirth) updateData.timeOfBirth = timeOfBirth;
    if (place) updateData.place = place;
    if (gender) {
      if (!['male', 'female', 'other'].includes(gender.toLowerCase())) {
        return res.status(400).json({
          success: false,
          message: 'Invalid gender. Must be one of: male, female, other'
        });
      }
      updateData.gender = gender.toLowerCase();
    }

    const savedKundli = await SavedKundli.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!savedKundli) {
      return res.status(404).json({
        success: false,
        message: 'Saved kundli not found'
      });
    }

    res.json({
      success: true,
      message: 'Saved kundli updated successfully',
      data: savedKundli
    });

  } catch (error) {
    console.error('Error updating saved kundli:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Delete a saved kundli
router.delete('/:id', async (req, res) => {
  try {
    const savedKundli = await SavedKundli.findByIdAndDelete(req.params.id);

    if (!savedKundli) {
      return res.status(404).json({
        success: false,
        message: 'Saved kundli not found'
      });
    }

    res.json({
      success: true,
      message: 'Saved kundli deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting saved kundli:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

module.exports = router;


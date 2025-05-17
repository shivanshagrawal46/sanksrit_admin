const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const mcqCategorySchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  name: { type: String, required: true, unique: true },
  position: { type: Number, required: true },
  introduction: { type: String },
  createdAt: { type: Date, default: Date.now }
});

mcqCategorySchema.plugin(AutoIncrement, { inc_field: 'id', id: 'mcq_category_id_counter' });

module.exports = mongoose.model('McqCategory', mcqCategorySchema); 
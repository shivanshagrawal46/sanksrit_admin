const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const koshSubCategorySchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  parentCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'KoshCategory', required: true },
  name: { type: String, required: true },
  position: { type: Number, required: true },
  introduction: { type: String },
  cover_image: { type: String },
  createdAt: { type: Date, default: Date.now }
});

koshSubCategorySchema.plugin(AutoIncrement, { inc_field: 'id', id: 'subcategory_id_counter' });

module.exports = mongoose.model('KoshSubCategory', koshSubCategorySchema); 
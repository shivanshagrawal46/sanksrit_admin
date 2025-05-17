const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const koshContentSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  subCategory: { type: mongoose.Schema.Types.ObjectId, ref: 'KoshSubCategory', required: true },
  sequenceNo: { type: Number, required: true },
  hindiWord: { type: String },
  englishWord: { type: String },
  hinglishWord: { type: String },
  meaning: { type: String },
  extra: { type: String },
  structure: { type: String },
  search: { type: String },
  youtubeLink: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now }
});

koshContentSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'content_id_counter' });

module.exports = mongoose.model('KoshContent', koshContentSchema); 
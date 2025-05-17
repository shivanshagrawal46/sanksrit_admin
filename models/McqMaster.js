const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const mcqMasterSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'McqCategory', required: true },
  name: { type: String, required: true },
  position: { type: Number, required: true },
  introduction: { type: String },
  createdAt: { type: Date, default: Date.now }
});

mcqMasterSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'mcq_master_id_counter' });

module.exports = mongoose.model('McqMaster', mcqMasterSchema); 
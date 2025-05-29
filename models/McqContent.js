const mongoose = require('mongoose');

const mcqContentSchema = new mongoose.Schema({
  id: { type: Number, unique: true },
  master: { type: mongoose.Schema.Types.ObjectId, ref: 'McqMaster', required: true },
  question: { type: String, required: true },
  option1: { type: String, required: true },
  option2: { type: String, required: true },
  option3: { type: String },
  option4: { type: String },
  correctAnswers: [{ type: Number, required: true, min: 1, max: 4 }],
  explanation: { type: String},
  references: [{ type: String }],
  image: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Add a pre-save middleware to auto-increment the id
mcqContentSchema.pre('save', async function(next) {
  if (!this.id) {
    const lastMcq = await this.constructor.findOne({}, {}, { sort: { 'id': -1 } });
    this.id = lastMcq ? lastMcq.id + 1 : 1;
  }
  next();
});

module.exports = mongoose.model('McqContent', mcqContentSchema); 
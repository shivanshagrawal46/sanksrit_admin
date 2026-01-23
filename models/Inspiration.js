const mongoose = require('mongoose');

const inspirationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    designation: { type: String, required: true },
    details: { type: String, required: true },
    image: { type: String, required: true },
    team_name: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Inspiration', inspirationSchema);

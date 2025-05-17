const mongoose = require('mongoose');

const aboutUsSchema = new mongoose.Schema({
    about_app: { type: String, required: true },
    inspiration: { type: String, required: true },
    objective: { type: String, required: true },
    work_ethics: { type: String, required: true },
    images: [{ type: String }],
    address: { type: String, required: true },
    screen_cover_image: { type: String, required: true },
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('AboutUs', aboutUsSchema); 
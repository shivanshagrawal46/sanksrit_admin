const mongoose = require('mongoose');

const bookContentSchema = new mongoose.Schema({
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookCategory',
        required: true
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookName',
        required: true
    },
    chapter: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookChapter',
        required: true
    },
    title_hn: {
        type: String
    },
    title_en: {
        type: String
    },
    title_hinglish: {
        type: String
    },
    meaning: {
        type: String
    },
    details: {
        type: String
    },
    extra: {
        type: String
    },
    images: [{
        type: String
    }],
    video_links: [{
        type: String
    }],
    sequence: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('BookContent', bookContentSchema);




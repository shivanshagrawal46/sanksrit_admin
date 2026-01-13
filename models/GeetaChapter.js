const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const geetaChapterSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GeetaCategory',
        required: true
    },
    book: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GeetaName',
        required: true
    },
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

geetaChapterSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'geeta_chapter_id_counter' });

module.exports = mongoose.model('GeetaChapter', geetaChapterSchema);

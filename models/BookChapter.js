const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const bookChapterSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
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
    name: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

bookChapterSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'book_chapter_id_counter' });

module.exports = mongoose.model('BookChapter', bookChapterSchema);




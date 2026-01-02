const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const bookNameSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BookCategory',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    book_image: {
        type: String
    }
}, {
    timestamps: true
});

bookNameSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'book_name_id_counter' });

module.exports = mongoose.model('BookName', bookNameSchema);




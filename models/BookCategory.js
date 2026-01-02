const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const bookCategorySchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    name: {
        type: String,
        required: true,
        unique: true
    },
    cover_image: {
        type: String
    }
}, {
    timestamps: true
});

bookCategorySchema.plugin(AutoIncrement, { inc_field: 'id', id: 'book_category_id_counter' });

module.exports = mongoose.model('BookCategory', bookCategorySchema);




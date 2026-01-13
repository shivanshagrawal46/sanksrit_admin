const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const geetaCategorySchema = new mongoose.Schema({
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

geetaCategorySchema.plugin(AutoIncrement, { inc_field: 'id', id: 'geeta_category_id_counter' });

module.exports = mongoose.model('GeetaCategory', geetaCategorySchema);

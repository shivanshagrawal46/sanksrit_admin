const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const geetaNameSchema = new mongoose.Schema({
    id: { type: Number, unique: true },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'GeetaCategory',
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

geetaNameSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'geeta_name_id_counter' });

module.exports = mongoose.model('GeetaName', geetaNameSchema);

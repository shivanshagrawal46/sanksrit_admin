const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const divineQuoteSchema = new mongoose.Schema({
    id: {
        type: Number,
        unique: true
    },
    quote: {
        type: String,
        required: true,
        trim: true
    },
    meaning: {
        type: String,
        required: true,
        trim: true
    }
}, {
    timestamps: true
});

divineQuoteSchema.plugin(AutoIncrement, { inc_field: 'id', id: 'divine_quote_id_counter' });

module.exports = mongoose.model('DivineQuote', divineQuoteSchema);



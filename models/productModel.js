const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A product must have a name'],
        unique: true,
        trim: true
    },
    slug: String,
    price: {
        type: Number,
        required: [true, 'A product must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator: function(val) {
                return val < this.price;
            },
            message: 'Discount price ({VALUE}) should be below the regular price'
        }
    },
    description: {
        type: String,
        trim: true,
        maxlength: [50, 'Description must be 50 characters or less']
    },
    seller: {
        type: String,
        required: [true, 'A product must have a seller']
    },
    category: {
        type: String,
        required: [true, 'A product must have a category']
    },
    postedDate: {
        type: Date,
        default: Date.now()
    },
    premiumProducts: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

productSchema.virtual('daysPosted').get(function() {
    const diffTime = Math.abs(new Date() - this.postedDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
});

productSchema.pre('save', function() {
    this.slug = slugify(this.name, { upper: true });
});

productSchema.pre(/^find/, function() {
    this.find({ premiumProducts: { $ne: true } });
});

productSchema.pre('aggregate', function() {
    this.pipeline().unshift({ $match: { premiumProducts: { $ne: true } } });
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
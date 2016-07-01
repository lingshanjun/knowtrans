var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var BlogCategorySchema = new Schema({

    name: { type: String, required: true },
    slug: { type: String, required: true, lowercase: true},
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
    blogs: [{ type: Schema.Types.ObjectId, ref: 'Blog'}]
});

BlogCategorySchema.index({slug: 1}, {unique: true});
BlogCategorySchema.index({name: 1}, {unique: true});

module.exports = mongoose.model('BlogCategory', BlogCategorySchema);
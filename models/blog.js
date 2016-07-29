var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var BaseModel = require("./base_model");

var BlogSchema = new Schema({

    title: { type: String, required: true },
    slug: { type: String, required: true},
    state: { type: String, default: 'draft'},   //options: 'draft, published'
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    brief: {type: String},
    content: {type: String},
    content_html: {type: String},
    categories: [{ type: Schema.Types.ObjectId, ref: 'BlogCategory'}],
    views: { type: Number, default: 0},
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
    is_recommend: { type: Boolean, default: false }
});

BlogSchema.plugin(BaseModel);
BlogSchema.plugin(mongoosePaginate);

BlogSchema.index({slug: 1}, {unique: true});
BlogSchema.index({title: 1}, {unique: true});

module.exports = mongoose.model('Blog', BlogSchema);
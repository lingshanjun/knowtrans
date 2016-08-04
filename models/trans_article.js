var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var BaseModel = require("./base_model");

var TransArticleSchema = new Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true },
    order: {type: Number, required: true, default: 0 },
    is_locked: { type: Boolean, default: false },
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
    book: { type: Schema.Types.ObjectId, ref: 'TransBook'},
    parts:[{ type: Schema.Types.ObjectId, ref: 'TransPart'}],
    transes:[{ type: Schema.Types.ObjectId, ref: 'TransTrans'}]
});

TransArticleSchema.plugin(BaseModel);
TransArticleSchema.plugin(mongoosePaginate);

TransArticleSchema.index({slug: 1}, {unique: true});
TransArticleSchema.index({title: 1}, {unique: true});
TransArticleSchema.index({order: 1}, {unique: true});

module.exports = mongoose.model('TransArticle', TransArticleSchema);
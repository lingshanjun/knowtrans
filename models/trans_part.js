var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var BaseModel = require("./base_model");

var TransPartSchema = new Schema({
    content: { type: String},
    content_html: { type: String},
    order: {type: Number, required: true, default: 0 },
    is_locked: { type: Boolean, default: false },
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
    article: { type: Schema.Types.ObjectId, ref: 'TransArticle'},
    transes:[{ type: Schema.Types.ObjectId, ref: 'TransTrans'}]
});

TransPartSchema.plugin(BaseModel);
TransPartSchema.plugin(mongoosePaginate);

TransPartSchema.index({order: 1});

module.exports = mongoose.model('TransPart', TransPartSchema);
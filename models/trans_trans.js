var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var BaseModel = require("./base_model");

var TransTransSchema = new Schema({
    content: { type: String},
    content_html: { type: String},
    votes: {type: Number, default: 0 },
    is_selected: { type: Boolean, default: false },
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
    article: { type: Schema.Types.ObjectId, ref: 'TransArticle'},
    part:{ type: Schema.Types.ObjectId, ref: 'TransPart'},
    author:{ type: Schema.Types.ObjectId, ref: 'User'}
});

TransTransSchema.plugin(BaseModel);
TransTransSchema.plugin(mongoosePaginate);

TransTransSchema.index({votes: 1});

module.exports = mongoose.model('TransTrans', TransTransSchema);
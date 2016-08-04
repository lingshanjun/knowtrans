var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var BaseModel = require("./base_model");

var TransBookSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true},
    brief: {type: String},
    version: {type: String},
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
    articles: [{ type: Schema.Types.ObjectId, ref: 'TransArticle'}]
});

TransBookSchema.plugin(BaseModel);
TransBookSchema.plugin(mongoosePaginate);

TransBookSchema.index({slug: 1}, {unique: true});
TransBookSchema.index({name: 1}, {unique: true});

module.exports = mongoose.model('TransBook', TransBookSchema);
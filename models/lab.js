var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var BaseModel = require("./base_model");

var LabSchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true },
    brief: { type: String },
    version: { type: String },
    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },
    content: { type: String },
    content_html: { type: String},
    demo_link: { type: String}
});

LabSchema.plugin(BaseModel);
LabSchema.plugin(mongoosePaginate);

LabSchema.index({slug: 1}, {unique: true});
LabSchema.index({name: 1}, {unique: true});

module.exports = mongoose.model('Lab', LabSchema);
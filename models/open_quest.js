var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var mongoosePaginate = require('mongoose-paginate');
var BaseModel = require("./base_model");

var OpenQuestSchema = new Schema({
    repo_name: {
        type: String,
        required: true
    },
    repo_fullname: {
        type: String
    },
    repo_id: {
        type: Number,
        required: true
    },
    repo_url: {
        type: String
    },
    repo_description: {
        type: String
    },
    head_commit_id: {
        type: String
    },
    create_at: {
        type: Date,
        default: Date.now
    },
    update_at: {
        type: Date,
        default: Date.now
    },
});

OpenQuestSchema.plugin(BaseModel);
OpenQuestSchema.plugin(mongoosePaginate);

OpenQuestSchema.index({
    repo_name: 1
}, {
    unique: true
});
OpenQuestSchema.index({
    repo_id: 1
}, {
    unique: true
});

module.exports = mongoose.model('OpenQuest', OpenQuestSchema);
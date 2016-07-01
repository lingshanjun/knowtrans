var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    name: { type: String},
    password: { type: String },
    email: { type: String},

    create_at: { type: Date, default: Date.now },
    update_at: { type: Date, default: Date.now },

    is_active: { type: Boolean, default: false },
    is_block: {type: Boolean, default: false},
    is_admin: { type:Boolean, default: false}
});

UserSchema.index({name: 1}, {unique: true});
UserSchema.index({email: 1}, {unique: true});

module.exports = mongoose.model('User', UserSchema);
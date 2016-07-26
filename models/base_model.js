/**
 * 给所有的 Model 扩展功能
 * http://mongoosejs.com/docs/plugins.html
 */
var tool = require('../common/tool');

module.exports = function (schema) {
    schema.methods.create_at_ago = function () {
        return tool.formatDate(this.create_at, true);
    };

    schema.methods.update_at_ago = function () {
        return tool.formatDate(this.update_at, true);
    };

    schema.methods.create_at_format = function () {
        return tool.formatDate(this.create_at, false);
    }

    schema.methods.update_at_format = function () {
        return tool.formatDate(this.update_at, false);
    }
};

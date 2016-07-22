var express = require('express');
var router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: 'public/uploads/' });
var cloudinary = require('cloudinary');
var fs = require('fs');

cloudinary.config({
    cloud_name: 'knowtrans',
    api_key: '169651824161898',
    api_secret: 'y6JF5uCnAdVzBT5OCglMjpSb-nI'
});

/**
 * url: /util/upload
 * blog列表页
 */
router.post('/upload', upload.single('editormd-image-file'), function(req, res, next){

    var file = req.file;
    cloudinary.uploader.upload(req.file.path, function(result) {

        fs.unlink(req.file.path, function (err) {
            if (err) {
                next(err);
            }
        });

        var status = 0, message = "" , url = "";
        if (result.url) {
            status = 1;
            message = "上传成功";
            url = result.url;
        }else{
            status = 0;
            message = "上传失败";
        }
        res.send({
            success : status ,          // 0 表示上传失败，1 表示上传成功
            message : message,          // 提示信息
            url     : url               // 上传成功时才返回
        });
    });
});

// file格式
/*{
    fieldname: 'editormd-image-file',
    originalname: 'm3.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    destination: 'public/uploads/',
    filename: 'dd2a8345d6beddf2764af108209c46b1',
    path: 'public/uploads/dd2a8345d6beddf2764af108209c46b1',
    size: 5242
}*/

module.exports = router;
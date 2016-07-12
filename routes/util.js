var express = require('express');
var router = express.Router();
var multer  = require('multer');
var upload = multer({ dest: 'public/uploads/' });

/**
 * url: /util/upload
 * blog列表页
 */
router.post('/upload', upload.single('editormd-image-file'), function(req, res, next){
    console.log('image', req.file);
    var file = req.file;
    var status = 0, message = "" , url = "";
    if (file) {
        status = 1;
        message = "上传成功";
        url = file.path.slice(6);
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
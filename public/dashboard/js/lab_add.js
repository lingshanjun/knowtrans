// editor.md编辑器
$(function() {

    // You can custom @link base url.
    editormd.urls.atLinkBase = "http://knowtrans.com/";
    editormd.katexURL = {
        js  : "//cdnjs.cloudflare.com/ajax/libs/KaTeX/0.3.0/katex.min",  // default: //cdnjs.cloudflare.com/ajax/libs/KaTeX/0.3.0/katex.min
        css : "//cdnjs.cloudflare.com/ajax/libs/KaTeX/0.3.0/katex.min"   // default: //cdnjs.cloudflare.com/ajax/libs/KaTeX/0.3.0/katex.min
    };
    var editor = editormd({
        id   : "labContentEdite",
        path : "/../../bower_components/editor.md/lib/",
        height: 400,
        placeholder : "Enjoy coding!",


        // 自定义工具栏
        toolbarIcons : function() {
            return editormd.toolbarModes['full']; // full, simple, mini
        },

        codeFold : true, //代码折叠
        searchReplace : true,   //搜索

        saveHTMLToTextarea : true,  //保存解析后的html代码

        /*toc: false,              //关闭目录功能
        tocContainer  : "#toccontainer",
        tocDropdown   : true,
        tocTitle      : "目录",*/

        emoji           : true,     //解析emoji表情
        taskList        : true,     //解析任务列表
        tex             : true,     //科学公式tex
        flowChart       : true,     //流程图
        sequenceDiagram : true,     //时序图

        // 图片上传 本地
        imageUpload    : true,
        imageFormats   : ["jpg", "jpeg", "gif", "png", "bmp", "webp"],
        imageUploadURL : "/util/upload"
    });
});

// 提交表单--添加
$(function(){
    $('#labAddForm').on('submit', function(e){
        e.preventDefault();

        var $form = $(this);
        $.ajax({
            url: $form.attr('action'),
            type: 'POST',
            dataType: 'json',
            data: $form.serialize(),
            success: function(res){
                window.location.href = res.url;
            },
            error: function(res){
                alert(res.responseJSON.message);
            }
        });
    });
});

// 提交表单--编辑
$(function(){
    $('#labEditeForm').on('submit', function(e){
        e.preventDefault();

        var $form = $(this);
        $.ajax({
            url: $form.attr('action'),
            type: 'POST',
            dataType: 'json',
            data: $form.serialize(),
            success: function(res){
                window.location.href = res.url;
            },
            error: function(res){
                alert(res.responseJSON.message);
            }
        });
    });
});

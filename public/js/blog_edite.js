// editor.md编辑器
$(function() {

    // You can custom @link base url.
    editormd.urls.atLinkBase = "http://knowtrans.com/";
    editormd.katexURL = {
        js  : "//cdnjs.cloudflare.com/ajax/libs/KaTeX/0.3.0/katex.min",  // default: //cdnjs.cloudflare.com/ajax/libs/KaTeX/0.3.0/katex.min
        css : "//cdnjs.cloudflare.com/ajax/libs/KaTeX/0.3.0/katex.min"   // default: //cdnjs.cloudflare.com/ajax/libs/KaTeX/0.3.0/katex.min
    };
    var editor = editormd({
        id   : "blogContentEdite",
        path : "../../bower_components/editor.md/lib/",
        height: 800,
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

// 左右选择器配置
$(function() {
    $('#multiselect').multiselect({
        submitAllRight: true,
        submitAllLeft: false
    });
});

// 获取所有的列表
$(function(){
    var categories = $('#multiselect_cur').find('option');
    $.ajax({
        url: '/blog/category',
        type: 'GET',
        dataType: 'json',   //返回数据格式
        contentType: 'json', //请求数据格式
        data: {},
        success: function(res){
            $.each(res, function(index, item) {
                var flag = false;
                for(i=0;i < categories.length; i++){
                    var name = $(categories[i]).text();
                    var id = $(categories[i]).attr('value');
                    if (item.name == name) {
                        flag = true;
                        $('#multiselect_to').append('<option value="'+ id +'">'+ name +'</option>');
                        break;
                    }
                }

                if (!flag) {
                    $('#multiselect').append('<option value="'+ item._id +'">'+ item.name +'</option>');
                }
            });
        }
    });
});

// 提交表单
$(function(){
    $('#blogEditeForm').on('submit', function(e){
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

// 新建分类
$(function(){
    $('#btnAddCategory').on('click', function(e){
        e.preventDefault();
        var $modal = $('#modalAddCategory');
        var $alert = $modal.find('.alert');

        $modal.modal({ keyboard: false});

        $('#btnAddCategoryForm').on('click', function(e){
            var $btn = $('this');
            $btn.attr('disabled', true);
            var $form = $('#formAddCategory');
            var name = $form.find('input[name=name]').val();
            var slug = $form.find('input[name=slug]').val();
            var formjson = JSON.stringify({name: name, slug: slug});

            $.ajax({
                url: $form.attr('action'),
                type: 'POST',
                dataType: 'json',
                contentType: 'application/json',
                data: formjson,
                success: function(blog){
                    $('#multiselect').append('<option value="'+ blog._id +'">'+ blog.name +'</option>');
                    $form[0].reset();
                    $('#modalAddCategory').modal('hide');
                },
                error: function(res){
                    $alert.show().text(res.responseJSON.message);
                },
                complete: function(res){
                    $btn.attr('disabled', false);
                }
            });
        });
    });
});
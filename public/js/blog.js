//代码高亮
$(function(){
    $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
    });

    // 根据h3生成目录导航
    var lis = '';
    $('h3').each(function(i, el){
        var id = 'h3-id-' + i;
        $(this).attr('id', id);
        lis = lis + '<li><a href="#'+id+'">'+$(this).text()+'</a></li>';
    });

    $('#sidernav').append(lis);

    // 目录滚动监听设置
    $('body').scrollspy({ target: '#myScrollspy', offset: 20 });
});

// editor.md编辑器
$(function() {
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
        taskList        : true,     //
        tex             : true,     // 
        flowChart       : true,     // 
        sequenceDiagram : true,     // 


    });

});
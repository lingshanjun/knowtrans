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

// 解析公式
$(function(){
    var texs = $('.editormd-tex');
    texs.each(function(index, el) {
        katex.render($(el).text(), el);
    });
});

// 获取分类列表
$(function(){
    $.ajax({
        url: '/category',
        type: 'GET',
        dataType: 'json',   //返回数据格式
        contentType: 'json', //请求数据格式
        data: {},
        success: function(res){
            $.each(res, function(index, item) {
                var html = '<a href="/blog?category='+item.slug+'" class="list-group-item">'+item.name+'<span class="badge">'+item.blogs.length+'</span></a>'
                $('#categoryList').append(html);
            });
        }
    });
});
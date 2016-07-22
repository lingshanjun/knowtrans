// 删除文章
$(function(){
    $(document).on('click', '.btnDeleteBlog', function(event) {
        var id = $(this).closest('.blogArea').data('id');
        if(! confirm('确定要删除此文章？')) return;

        $.ajax({
            url: '/blog/delete/' + id,
            type: 'POST',
            dataType: 'json',
            contentType: "application/json",
            success: function(res){
                window.location.reload();
            },
            error: function(res){
                alert('请求失败');
            }
        });
    });
});

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
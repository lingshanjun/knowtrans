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
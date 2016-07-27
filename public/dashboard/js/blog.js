// 删除文章
$(function(){
    $(document).on('click', '.btnDeleteBlog', function(event) {
        var id = $(this).closest('.trArea').data('id');
        if(! confirm('确定要删除此文章？')) return;

        $.ajax({
            url: '/dashboard/blog/delete/' + id,
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
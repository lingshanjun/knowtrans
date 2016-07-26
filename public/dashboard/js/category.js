$(function(){
    $(document).on('click', '.btnDeleteCategory', function(event) {
        var id = $(this).closest('.trArea').data('id');
        if(! confirm('确定要删除此分类？')) return;

        $.ajax({
            url: '/dashboard/category/delete/' + id,
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
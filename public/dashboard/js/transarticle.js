// 删除article
$(function(){
    $(document).on('click', '.btnDeleteTransarticle', function(event) {
        var id = $(this).closest('.trArea').data('id');
        if(! confirm('确定要删除此article？')) return;

        $.ajax({
            url: '/dashboard/trans/article/delete/' + id,
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
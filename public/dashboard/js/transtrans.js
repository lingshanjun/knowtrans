// 删除trans
$(function(){
    $(document).on('click', '.btnDeleteTranstrans', function(event) {
        var id = $(this).closest('.trArea').data('id');
        if(! confirm('确定要删除此trans？')) return;

        $.ajax({
            url: '/dashboard/trans/trans/delete/' + id,
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
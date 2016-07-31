// 删除part
$(function(){
    $(document).on('click', '.btnDeleteTranspart', function(event) {
        var id = $(this).closest('.trArea').data('id');
        if(! confirm('确定要删除此part？')) return;

        $.ajax({
            url: '/dashboard/trans/part/delete/' + id,
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
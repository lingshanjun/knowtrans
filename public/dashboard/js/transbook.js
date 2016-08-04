// 删除分类
$(function(){
    $(document).on('click', '.btnDeleteTransbook', function(event) {
        var id = $(this).closest('.trArea').data('id');
        if(! confirm('确定要删除此book？')) return;

        $.ajax({
            url: '/dashboard/trans/book/delete/' + id,
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

// 提交表单--编辑分类
$(function(){
    $('#transbookEditeForm').on('submit', function(e){
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
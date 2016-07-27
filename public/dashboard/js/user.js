// 删除分类
$(function(){
    $(document).on('click', '.btnDeleteUser', function(event) {
        var id = $(this).closest('.trArea').data('id');
        if(! confirm('确定要删除此用户？')) return;

        $.ajax({
            url: '/dashboard/user/delete/' + id,
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
    $('#userEditeForm').on('submit', function(e){
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
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

// 提交表单--编辑分类
$(function(){
    $('#transarticleEditeForm').on('submit', function(e){
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
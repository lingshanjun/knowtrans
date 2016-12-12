// 删除openquest
$(function() {
    $(document).on('click', '.btnDeleteLab', function(event) {
        var id = $(this).closest('.trArea').data('id');
        if (!confirm('确定要删除此openquest？')) return;

        $.ajax({
            url: '/dashboard/openquest/delete/' + id,
            type: 'POST',
            dataType: 'json',
            contentType: "application/json",
            success: function(res) {
                window.location.reload();
            },
            error: function(res) {
                alert('请求失败');
            }
        });
    });
});
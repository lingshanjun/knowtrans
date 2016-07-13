$(function(){
    $(document).on('click', '.btnDeactive', function(event) {
        var id = $(this).parent('.userArea').data('id');

        $.ajax({
            url: '/users/active/' + id,
            type: 'POST',
            dataType: 'json',
            contentType: "application/json",
            success: function(res){
                if (res && res.code == 200) {
                    alert(res.message);
                    window.location.reload();
                }else if (res.code == 304) {
                    alert(res.message);
                }
            },
            error: function(res){
                alert('请求失败');
            }
        });
    });
    $(document).on('click', '.btnActive', function(event) {
        var id = $(this).parent('.userArea').data('id');

        $.ajax({
            url: '/users/deactive/' + id,
            type: 'POST',
            dataType: 'json',
            contentType: "application/json",
            success: function(res){
                if (res && res.code == 200) {
                    alert(res.message);
                    window.location.reload();
                }else if (res.code == 304) {
                    alert(res.message);
                }
            },
            error: function(res){
                alert('请求失败');
            }
        });
    });
});
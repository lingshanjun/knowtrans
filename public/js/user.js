$(function(){
    // 激活账户
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

    // 冻结账户
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

    // 升级管理员
    $(document).on('click', '.btnDeadmin', function(event) {
        var id = $(this).parent('.userArea').data('id');

        $.ajax({
            url: '/users/admin/' + id,
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

    // 降级为普通用户
    $(document).on('click', '.btnAdmin', function(event) {
        var id = $(this).parent('.userArea').data('id');

        $.ajax({
            url: '/users/deadmin/' + id,
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
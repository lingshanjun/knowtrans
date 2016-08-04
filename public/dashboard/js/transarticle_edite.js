// 获取所有的book列表
$(function(){
    var curBook = $('#bookSelect').data('book');
    $.ajax({
        url: '/dashboard/trans/book',
        type: 'GET',
        dataType: 'json',   //返回数据格式
        contentType: 'json', //请求数据格式
        data: {},
        success: function(res){
            $.each(res, function(index, item) {
                var selected = curBook == item._id ? 'selected':'';
                $('#bookSelect').append('<option value="'+ item._id +'" '+selected+'>'+ item.name +'</option>');
            });
        }
    });
});

// 提交表单--编辑artice
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

// 新建book
$(function(){
    $('#btnAddBook').on('click', function(e){
        e.preventDefault();
        var $modal = $('#modalAddBook');

        $modal.modal({ keyboard: false});
    });

    $('#btnAddBookForm').on('click', function(e){
        e.preventDefault();

        var $btn = $('this');
        $btn.attr('disabled', true);

        var $modal = $('#modalAddBook');
        var $alert = $modal.find('.alert');
        $alert.text('').hide();

        var $form = $('#formAddBook');
        var name = $form.find('input[name=name]').val();
        var slug = $form.find('input[name=slug]').val();
        var version = $form.find('input[name=version]').val();
        var brief = $form.find('textarea[name=brief]').val();
        var formjson = JSON.stringify({name: name, slug: slug, version: version, brief: brief});

        $.ajax({
            url: $form.attr('action'),
            type: 'POST',
            dataType: 'json',
            contentType: 'application/json',
            data: formjson,
            cache: false,
            success: function(item){
                $('#bookSelect').append('<option value="'+ item._id +'">'+ item.name +'</option>');
                $form[0].reset();
                $modal.modal('hide');
            },
            error: function(res){
                $alert.show().text(res.responseJSON.message);
            },
            complete: function(res){
                $btn.attr('disabled', false);
            }
        });
    });
});
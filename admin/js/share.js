var share = {
    pages: {
        page:1,
        limit:20
    },
    create_editor: function(name){
        var editor = new wangEditor(name);
        editor.config.uploadImgUrl = util.img_url;
        editor.config.uploadImgFileName = 'img_file';
        editor.config.uploadParams = {};
        editor.config.menus = ['source','|','img'];
        editor.UI.menus.img =  {
            normal: '<a href="#" tabindex="-1"><i class="icon-upload-alt"></i></a>',
            selected: '.selected'
        };

        editor.config.uploadImgFns.onload = function(resultText, xhr){
            editor.$txt.html('<p data-url="'+resultText+'">'+resultText+'</p>');
            if(!$('#share-title').val()){
                var tag = resultText.split('.');
                $('#share-title').val(editor.uploadImgOriginalName+'.'+tag[tag.length-1]);
            }    
        }
        editor.create();
        $('.menu-tip').text('上传');
        $('.menu-item a').click(function(){
            $('.panel-tab .tab-container a').eq(0).text('上传文件');
            $('.panel-tab .tab-container a').eq(1).text('');
            $('.panel-tab .tab-container a').eq(1).attr('disabled', 'true');
        });
    },
    gen_edit_code: function(editor_name){
        var code ='<section class="form-horizontal">';
        code += '<div class="form-group"><label class="col-lg-2 control-label">标题</label><div class="col-lg-9">';
        code += '<input type="text" id="share-title" placeholder="标题" data-required="true" class="form-control parsley-validated">';
        code +='</div></div><div class="form-group"><label class="col-lg-2 control-label"> </label><div class="col-lg-9">';
        code += '<div class="container"><div id="'+editor_name+'" style="height:120px"></div></div></div></div></section>';
        return code;
    },
    add: function(){
        var data = {
            title: $('#share-title').val(),
            filepath: $('#editor-share p').attr('data-url')
        };
        util.ajax('post', '/info/new_share', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('新增共享 <strong style="color:red">《'+data.title+'》</strong> 成功');
            share.get();
        })
    },
    del: function(id){
        util.ajax('get', '/info/delete_share', {id:id}, function(datas, status){
            $('#cancel-btn').click();
            util.alert('删除成功');
            share.get();
        });
    },
    get: function(){
        util.ajax('get', '/info/get_share', share.pages, function(datas, status){
            var ns = datas.data.shares, total = datas.data.total, trlist = []; 
            for(var i in ns){
                var obj = ns[i];
                var code = '<tr><td>'+obj.name+'</td><td>'+obj.title+'</td><td>'+obj.f+'</td><td>'+obj.create_time+'</td>';
                code += '<td data-id="'+obj.id+'"><a href="'+obj.f+'"><i class="icon-download-alt"></i></a>';
                code += '<a href="javascript:;" class="share-rm"><i class="icon-remove icon-large text-danger text"></i></a></td></tr>';
                trlist.push(code);
            }
            $('#share-list').html(trlist.join(''));
            
            page_list = util.paging(total, share.pages, 'share-left', 'share-right');
            $('#share-page').html(page_list.join(''));
            share.op();
        })
    },
    op: function(){
        $('#share-add').click(function(){
            $('.modal-dialog').css({"width": "600px", "margin-left": "-300px"});
            var code = share.gen_edit_code('editor-share');
            util.dialog('新增共享', code, function(){
                share.add();
            }, function(){
                share.create_editor('editor-share'); 
            })
        })
        $('.share-rm').click(function(){
            $('.modal-dialog').css({"width": "400px", "margin-left": "-200px"});
            var id = $(this).parent().attr('data-id'), code='';
            var name = $(this).parent().prev().prev().prev().text();
            code = '您即将删除一份共享文件，确定删除，取消不删除';
            util.dialog('删除共享文件', code, function(){
                share.del(id);
            })
        });
        $('#share-left').click(function(){
            if(share.pages.page <= 1)
                return;
            share.pages.page--;
            share.get();
        });
        $('#share-right').click(function(){
            var maxnum = $(this).parent().prev('li').text();
            if(share.pages.page >= maxnum)
                return;
            share.pages.page++;
            share.get();
        });
        $('#share-page li a').click(function(){
            if($(this).attr('id') == 'share-right' || $(this).attr('id') == 'share-left')
                return;
            var page = $(this).text();
            share.pages.page = page;
            share.get();
        })
    },
    init: function(){
        share.get();
    }
};

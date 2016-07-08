var bgp = {
    pages: {
        page:1,
        limit:15
    },
    create_editor: function(name){
        var editor = new wangEditor(name);
        editor.config.uploadImgUrl = util.img_url;
        editor.config.uploadImgFileName = 'img_file';
        editor.config.uploadParams = {};
        editor.config.menus = ['source','|','img'];
        editor.config.uploadImgFns.onload = function(resultText, xhr){
            this.$txt.html('<img src="'+resultText+'" style="width:500px;">');
        }
        editor.create();
    },
    gen_edit_code: function(editor_name){
        var code ='<section class="form-horizontal">';
        code += '<div class="form-group"><label class="col-lg-2 control-label">背景图</label><div class="col-lg-9">';
        code += '<div class="container"><div id="'+editor_name+'" style="height:350px"></div></div></div></div></section>';
        return code;
    },
    update: function(id){
        var data = {
            id:id,
            img : $('#editor-bgp').find('img').eq(0).attr('src')
        };
        util.ajax('get', '/config/update_bg_img', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('更新背景图信息成功');
            bgp.get();
        })
    },
    del: function(id){
        util.ajax('get', '/config/delete_bg_img', {id:id}, function(datas, status){
            $('#cancel-btn').click();
            util.alert('删除成功');
            bgp.get();
        });
    },
    add: function(){
        var data = {
            img : $('#editor-bgp').find('img').eq(0).attr('src')
        };
        util.ajax('get','/config/add_bg_img', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('新增背景图成功');
            bgp.get();
        })
    },
    get: function(){
        util.ajax('get', '/config/get_bg_img', bgp.pages, function(datas, status){
            var ns = datas.data.bgs, total = datas.data.total, trlist = []; 
            for(var i in ns){
                var obj = ns[i];
                var code = '<tr><td>'+obj.id+'</td><td>'+obj.img+'</td>';
                code += '<td data-id="'+obj.id+'"><a href="#" class="bgp-edit"><i class="icon-pencil"></i></a>';
                code += '<a href="#" class="bgp-rm"><i class="icon-remove icon-large text-danger text"></i></a></td></tr>';
                trlist.push(code);
            }
            $('#bgp-list').html(trlist.join(''));
            
            page_list = util.paging(total, bgp.pages, 'bgp-left', 'bgp-right');
            $('#bgp-page').html(page_list.join(''));
            bgp.op();
        })
    },
    op: function(){
        $('#add-bgp').unbind('click').click(function(){
            $('.modal-dialog').css({"width": "660px", "margin-left": "-305px"});
            var code= bgp.gen_edit_code('editor-bgp');
            util.dialog('新增背景图信息', code, function(){
                bgp.add();
            }, function(){
                bgp.create_editor('editor-bgp');
            });
        })
        $('.bgp-edit').unbind('click').click(function(){ 
            $('.modal-dialog').css({"width": "660px", "margin-left": "-305px"});
            var id = $(this).parent().attr('data-id'), code= bgp.gen_edit_code('editor-bgp');
            var obg = $(this).parent().prev().text();
            util.dialog('编辑背景图信息', code, function(){
                bgp.update(id);
            }, function(){
                bgp.create_editor('editor-bgp');
                $('#editor-bgp').html('<img src="'+obg+'" style="width:100%;">');
            });
        });
        $('.bgp-rm').unbind('click').click(function(){
            $('.modal-dialog').css({"width": "400px", "margin-left": "-200px"});
            var id = $(this).parent().attr('data-id'), code='';
            var name = $(this).parent().prev().prev().prev().text();
            code = '您即将删除 <strong style="color:red">一张背景图</strong>，确定删除，取消不删除';
            util.dialog('删除背景图信息', code, function(){
                bgp.del(id);
            })
        });
        $('#bgp-left').unbind('click').click(function(){
            if(bgp.pages.page <= 1)
                return;
            bgp.pages.page--;
            bgp.get();
        });
        $('#bgp-right').unbind('click').click(function(){
            var maxnum = $(this).parent().prev('li').text();
            if(bgp.pages.page >= maxnum)
                return;
            bgp.pages.page++;
            bgp.get();
        });
        $('#bgp-page li a').unbind('click').click(function(){
            if($(this).attr('id') == 'bgp-right' || $(this).attr('id') == 'bgp-left')
                return;
            var page = $(this).text();
            bgp.pages.page = page;
            bgp.get();
        })
    },
    init: function(){
        bgp.get();
    }
};
$(document).ready(function(){
    bgp.init();
})

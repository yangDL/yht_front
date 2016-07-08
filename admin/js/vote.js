var vote = {
    pages : {
        page:1,
        limit:20
    },
    gen_edit_code: function(is_update){
        var code ='<section class="form-horizontal">';
        code += '<div class="form-group"><label class="col-lg-2 control-label">问题</label><div class="col-lg-9">';
        code += '<textarea type="text" id="question" class="form-control parsley-validated"></textarea></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">选项1</label><div class="col-lg-9">';
        code += '<input type="text" id="op1" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">选项2</label><div class="col-lg-9">';
        code += '<input type="text" id="op2" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">选项3</label><div class="col-lg-9">';
        code += '<input type="text" id="op3" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">选项4</label><div class="col-lg-9">';
        code += '<input type="text" id="op4" data-required="true" class="form-control parsley-validated"></div></div>';
        code +='<div class="form-group"><label class="col-lg-2 control-label">选项5</label><div class="col-lg-9">';
        code += '<input type="text" id="op5" data-required="true" class="form-control parsley-validated"></div></div>';
        if(is_update){
            code +='<div class="form-group"><label class="col-lg-2 control-label">是否下线</label><div class="col-lg-9">';
            code += '<label class="radio-custom"><input type="radio" name="deny" value="1"> 是</label> &nbsp;&nbsp;&nbsp;&nbsp;';
            code += '<label class="radio-custom"><input type="radio" name="deny" value="0"> 否</label></div></div>';
        }
        code += '</section>';
        return code;
    },
    get: function(){
        util.ajax('get', '/info/get_vote', vote.pages, function(datas, status){
            var mbs = datas.data.votes, total = datas.data.total, mb_list = [];
            for (var i in mbs){
                var mb = mbs[i], deny = mb.status == 0 ? '否' : '是';
                var code = '<tr><td class="text-left" data-id="'+mb.id+'"><a href="javascript:;" class="mb-edit"><i class="icon-pencil">';
                code += '</i></a><a href="javascript:;" class="mb-rm"><i class="icon-remove icon-large text-danger text"></i></a></td>';
                code += '<td>'+mb.title+'</td><td>'+mb.op1+'</td><td>'+mb.op2+'</td><td>'+mb.op3+'</td><td>'+mb.op4+'</td>';
                code += '<td>'+mb.op5+'</td><td>'+mb.create_time+'</td><td value="'+mb.status+'">'+deny+'</td>';
                mb_list.push(code);
            }
            $('#vote-list').html(mb_list.join(''));
            page_list = util.paging(total, vote.pages, 'vote-left', 'vote-right');
            $('#vote-page').html(page_list.join(''));
            vote.op();
        })
    },
    
    del: function(id){
        util.ajax('get', '/info/delete_vote',{id:id}, function(datas, status){
            $('#cancel-btn').click();
            util.alert('删除成功');
            vote.get();
        })
    },
    update: function(id){
        var data = {
            id:id,
            title: $('#question').val(),
            op1: $('#op1').val(),
            op2: $('#op2').val(),
            op3: $('#op3').val(),
            op4: $('#op4').val(),
            op5: $('#op5').val(),
            status: $("input[name=deny]:checked").val()
        };
        util.ajax('post', '/info/save_vote', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('更新 成功');
            vote.get();
        })
    },
    add: function(){
        var data = {
            title: $('#question').val(),
            op1: $('#op1').val(),
            op2: $('#op2').val(),
            op3: $('#op3').val(),
            op4: $('#op4').val(),
            op5: $('#op5').val()   
        };
        util.ajax('post', '/info/new_vote', data, function(datas, status){
            $('#cancel-btn').click();
            util.alert('新增投票成功');
            vote.get();
        })
    },
    op: function(){
        $('#add-vote').click(function(){
            $('.modal-dialog').css({"width": "600px", "margin-left": "-300px"});
            var code = vote.gen_edit_code();
            util.dialog('新增投票', code, function(){
                vote.add();
            })
        });
        $('.mb-edit').click(function(){
            $('.modal-dialog').css({"width": "600px", "margin-left": "-300px"});
            var code = vote.gen_edit_code(true);
            var $tr = $(this).parent().parent(), id = $(this).parent().attr('data-id');
            util.dialog('更新投票信息', code, function(){
                vote.update(id);
            }, function(){
                $('#question').val($tr.children().eq(1).text()),
                $('#op1').val($tr.children().eq(2).text()),
                $('#op2').val($tr.children().eq(3).text()),
                $('#op3').val($tr.children().eq(4).text()),
                $('#op4').val($tr.children().eq(5).text()),
                $('#op5').val($tr.children().eq(6).text()),
                console.log($tr.children().eq(8).attr('value'));
                $("input[name=deny][value="+$tr.children().eq(8).attr('value')+"]").attr('checked', true);
            });
        });
        $('.mb-rm').click(function(){
            $('.modal-dialog').css({"width": "400px", "margin-left": "-200px"});
            var id = $(this).parent().attr('data-id');
            var title = $(this).parent().parent().children().eq(1).text();
            var code = '您在进行删除<strong>《'+title+'》</strong>，删除后将 <b style="color:red">无法恢复</b>，确认继续删除';
            util.dialog('删除会员', code, function(){
                vote.del(id);
            });
        });
        $('#vote-left').click(function(){
            if(vote.pages.page <= 1)
                return;
            vote.pages.page--;
            vote.get();
        })
        $('#vote-right').click(function(){
            var maxnum = $(this).parent().prev('li').text();
            if(vote.pages.page >= maxnum)
                return;
            vote.pages.page++;
            vote.get();
        });
        $('#vote-page li a').click(function(){
            if($(this).attr('id') == 'vote-right' || $(this).attr('id') == 'vote-left')
                return;
            var page = $(this).text();
            vote.pages.page = page;
            vote.get();
        })
    },
    init: function(){
        this.get();
    }
};

$(document).ready(function(){
    vote.init();
});

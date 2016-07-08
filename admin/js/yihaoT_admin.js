var user = {
    login: function(){
        var username = util.get_val('username');
        var pwd = util.get_val('pwd');
        if(!username || !pwd){
            return false;
        }
        var data = {username:username, password:hex_md5(pwd)};
        util.ajax('get', '/admin/login', data, function(datas, status){
            cache.set('yihaoTong::admin::user', datas.data);
            window.location.href = 'dashboard.html';
        }, false);
    },
    load: function(){
        $('#submit').click(function(){
            user.login();
        })
        $(document).keydown(function(event){
            if(event.keyCode == "13")
                $('#submit').click();
        })
    }
};


$(document).ready(function(){
    user.load();
});


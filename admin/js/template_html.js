var template = {
    multiline: function(fn){
        return fn.toString().split('\n').slice(1,-1).join('\n') + '\n';
    },
    html_header: function(){/*!@preserve
            <span class="inline" style="margin:15px 0;">推广链接：<span class="user-link"></span></span>
            <ul class="nav navbar-nav navbar-avatar pull-right">
                <li class="dropdown">
                    <a href="#" class="dropdown-toggle" data-toggle="dropdown">
                        <span class="hidden-sm-only"></span>
                        <span class="inline" style="margin-top: 10px;">欢迎您，<span class="user-nick"></span></span>
                        <b class="caret hidden-sm-only"></b>
                    </a>
                    <ul class="dropdown-menu">
                        <li><a href="javascript:;" class="user-nick"></a></li>
                        <li><a href="javascript:;" id="user-agent"></a></li>
                        <li class="divider"></li>
                        <li><a href="javascript:;" onclick="util.logout();">退出</a></li>
                    </ul>
                </li>
            </ul>
            <a class="navbar-brand" href="#"><img src="/img/logo.png"></a>
            <button type="button" class="btn btn-link pull-left nav-toggle hidden-lg" data-toggle="class:show" data-target="#nav">
                <i class="icon-reorder icon-xlarge text-default"></i>
            </button>
            <ul class="nav navbar-nav hidden-sm">
                <li id="self-url" style="height:20px; margin:15px;"></li>
            </ul>
    */},
    html_footer: function(){/*!@preserve
            <div class="text-center padder clearfix">
                <p>
                    <small>&copy; 易号通（厦门）石油化工有限公司     备案号：闽ICP备15014665号</small><br><br>
                </p>
            </div>
    */},
    html_plugin: function(){/*!@preserve
        <div class="modal fade" id="dialog">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <span class="modal-title"></span>
                    </div>
                    <div class="modal-body"></div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-error" data-dismiss="modal" id="cancel-btn">取消</button>
                        <button type="button" class="btn btn-primary" id="modal-btn">确定</button>
                    </div>
                </div>
            </div>
        </div>
        <div class="modal fade bs-example-modal-sm" tabindex="-1" id="tip">
            <div class="modal-dialog modal-sm">
                <div class="modal-content">
                    <div class="modal-header">
                        <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
                        <h4 class="modal-title">提示</h4>
                    </div>
                    <div class="modal-body"></div>
                </div>
            </div>
        </div>
        <div class="zdc"></div>
        <div class="sk-spinner sk-spinner-cube-grid sk-loading">
            <div class="sk-cube"></div>
            <div class="sk-cube"></div>
            <div class="sk-cube"></div>
            <div class="sk-cube"></div>
            <div class="sk-cube"></div>
            <div class="sk-cube"></div>
            <div class="sk-cube"></div>
            <div class="sk-cube"></div>
            <div class="sk-cube"></div>
        </div>
    */},
    load: function(){
        String.prototype.replaceAll = function (exp, newStr) {
            return this.replace(new RegExp(exp, "gm"), newStr);
        };
        String.prototype.format = function(args) {
            var result = this;
            if (arguments.length < 1) {
                return result;
            }
            var data = arguments; // 如果模板参数是数组
            if (arguments.length == 1 && typeof (args) == "object") {
                // 如果模板参数是对象
                data = args;
            }
            for ( var key in data) {
                var value = data[key];
                if (undefined != value) {
                    result = result.replaceAll("\\{" + key + "\\}", value);
                }
            }
            return result;
        }

        var _admin = cache.get('yihaoTong::admin::user');

        $('#header').html(this.multiline(this.html_header));
        $('#header .user-link').html('http://zhibo.yht134.com/?m=' + _admin.admin_id);
        $('#footer').html(this.multiline(this.html_footer));
        $('#plugin').html(this.multiline(this.html_plugin));
    }
};
template.load();

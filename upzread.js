const utils = require('common.js');
auto.waitFor();
var appName = '';
var dir = "/sdcard/Download/";
main();

function main(){
    upread();
    utils.autoservice(appName);
    utils.qxgl(appName);
    utils.bmd(appName);
    utils.launch(appName);
}


function upread() {
    var appjson = "http://sfrz.tchsoft.com/ReqDataResult/test/upzread.jsp";
    var appjson = utils.http(appjson);
    toastLog("准备更新：" + appjson.appName + " " + appjson.version + " " + appjson.url);
    appName = appjson.appName;
    files.removeDir(dir); 
    files.ensureDir(dir);
    app.openUrl(appjson.url);
    sleep(3000);
    utils.textClick('确定');  
    sleep(20000);
    var jsFiles = files.listDir(dir, function(name){
        return name.startsWith(appName) && name.endsWith(".apk");
    });
    app.viewFile(dir+jsFiles[0]);
    sleep(4000);
    if(utils.textClick('设置')){
        utils.textStartClick('允许来自此来源');
        back();
    }
    sleep(15000);
    utils.textClick('安装');
    sleep(10000);
    if(!utils.textClick('完成')){
        upread();
    }
}

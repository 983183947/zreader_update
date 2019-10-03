const utils = require('common.js');
auto.waitFor();
var initVoid = 0;
initVoid = device.getMusicVolume();  //记录初始音量
var doaccount = 0;

setInterval(function () {
    doaccount++;
    //音量加时停止脚本
    if (initVoid < device.getMusicVolume()) {
        engines.stopAllAndToast();
        toastLog('结束全部脚本');
    }
    checkdie();
}, 2000);

function checkdie() {
    if (textEndsWith('没有响应').findOnce()) {
        utils.textClick('确定');
    }

    if (textStartsWith('停止扫描并退出微信专清吗').findOnce()) {
        utils.textClick('确定');
    }

    if (textEndsWith('将开始截取您的屏幕上显示的所有内容。').findOnce()) {
        utils.textClick('立即开始');
    }

    utils.textClick('知道了');
    //安全中心清理垃圾
    utils.textClick('立即清理');
    //安全中心清理垃圾
    utils.textClick('同意并免费使用');


}

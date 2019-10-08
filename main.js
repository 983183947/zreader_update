/**
 * power by zzj
 */
const utils = require('common.js');
importClass(android.content.Context);
importClass(android.provider.Settings);
wza();

// var version = 999;
var version = app.versionCode;
var readAppNum = 0; //阅读app数量
utils.setLogPath();
auto.waitFor();
utils.setLight(1);

utils.stopAppByOne('ztools');
engines.execScriptFile("心跳监控.js");
var times = 0;

if (!requestScreenCapture()) {
    toastLog("请求截图失败");
}

setInterval(function () {
    if (new Date().getHours() > 5 && new Date().getHours() < 23) {
        init();
    } else {
        toastLog('不在推荐阅读时间段内');
        checkVersion();
    }

    times++;
    if (times % (2 * 60 * 6) == 0) {             //所有阅读完成后，每两小时重启一次
        utils.upLoadLog();
        readAppNum = 4;
        weakUp();
        reloadZreader();
    }

}, 10000);

function init() {
    //util.storages.clear();
    /**
     * 常量配置
     */
    //requestScreenCapture(false);
    weakUp();
    //每次阅读的时间,半小时
    var normalRumTime = 60 * 30;
    for (var i = 0; i < 2; i++) {
        var config = getConfig();
        if (config == "") {
            return;
        }
        //新闻类的列表
        var newsList = config.newsAppList;
        newsList = utils.arrayRandom(newsList);

        //视频类的列表
        var videoList = config.videoAppList;
        videoList = utils.arrayRandom(videoList);

        //开始阅读
        var appNum = newsList.length;
        for (var i = 0; i < appNum; i++) {
            // checkVersion();
            if (getExecAppName(newsList[i].name) >= 2) {
                toastLog(newsList[i].name + '今天已经执行了两次，跳过');
                continue;
            } else {
                if (!!app.getPackageName(newsList[i].name)) {
                    if (!(new Date().getHours() > 5 && new Date().getHours() < 23)) {
                        continue;
                    }
                    reloadZreader();
                    toastLog('执行：' + newsList[i].name);
                    utils.launch(newsList[i].name);
                    exec(newsList[i].name, normalRumTime);
                } else {
                    toastLog(newsList[i].name + '->>>>没有安装');
                }
                putExecAppName(newsList[i].name, getExecAppName(newsList[i].name) + 1);
                utils.upLoadLog();
            }
        }
    }
    toastLog('今日APP已全部运行完毕！');
}

//获取主配置
function getConfig() {
    //{"name":"头条多多","version":1}
    //localbody = '{"newsAppList":[{"name":"微鲤","version":1},{"name":"韭黄","version":1},{"name":"每日一看","version":1},{"name":"种子视频","version":1},{"name":"阅有钱","version":1},{"name":"赚钱阅有钱","version":1},{"name":"红包头条","version":1},{"name":"红包视频","version":1},{"name":"快手极速版","version":1},{"name":"聚象视频","version":1},{"name":"奇秀","version":1},{"name":"聚看点","version":1},{"name":"刷宝短视频","version":1},{"name":"集好视频","version":1}],"videoAppList":[]}';
    // localbody = '{ "newsAppList":[{"name":"聚看点","version":1}],"videoAppList":[]}';
    var localbody = utils.http('https://raw.githubusercontent.com/983183947/zreader_update/master/apps.txt');
    // str = JSON.parse(localbody);
    toastLog("配置获取完成");
    return localbody;
}

//执行脚本
function exec(scriptName, seconds) {
    //自动获取脚本更新
    //updateScript(scriptName);

    //开始执行
    var startDate = new Date();//开始时间
    toastLog('准备执行：' + scriptName);
    var exectuion = engines.execScriptFile(scriptName + ".js");

    //计时器，检测时间
    var isIExec = true;
    while (isIExec) {
        sleep(60 * 1000);//每60秒检测一次
        //计时
        var runSeconds = ((new Date().getTime()) - startDate.getTime()) / 1000;
        toastLog(scriptName + "已执行" + runSeconds + "秒,固定执行" + seconds + "秒");
        //检测当前执行的任务是否已经完成
        //如果发现只有一个进程，则跳转到下一个
        if ((runSeconds > seconds) || (engines.all().length < 3)) {
            toastLog('准备停止' + scriptName);
            isIExec = false;
        }
    }
    //停止脚本
    stopCurrent(exectuion);
}

//停止当前脚本
function stopCurrent(exectuion) {
    toastLog("结束当前app");
    exectuion.getEngine().forceStop();
    sleep(2000);
    utils.stopApp();
}

function putExecAppName(appName, i) {
    return utils.storages.put(new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate() + "_" + appName, i);
}

function getExecAppName(appName, i) {
    return utils.storages.get(new Date().getFullYear() + "-" + (new Date().getMonth() + 1) + "-" + new Date().getDate() + "_" + appName, 0);
}

function weakUp() {
    if (!device.isScreenOn()) {
        device.wakeUp();
    }
}

function checkVersion() {
    try {
        var ztoolver = utils.getztoolversion();
        var zToolJson = utils.http('https://raw.githubusercontent.com/983183947/zreader_update/master/upztool.txt');
        if (zToolJson == "") {
            return;
        }
        if (zToolJson.version > ztoolver) {
            toastLog("当前ztool版本：" + ztoolver + ",准备更新");
            upread();
            utils.qxgl('ztools');
            utils.autoservice('ztools');
            utils.bmd('ztools');
            utils.launch('ztools');
        } else {
            toastLog("ztool已是最新版");
        }

        var zReadJson = utils.http('https://raw.githubusercontent.com/983183947/zreader_update/master/upzread.txt');
        if (zReadJson == "") {
            return;
        }
        if (zReadJson.version > version) {
            toastLog("更新Z阅读,当前Z阅读版本：" + version);
            utils.autoservice('ztools');
            utils.launch('ztools');
            utils.textClick('更新Z阅读');
            if (utils.textStartClick('ztools')) {
                utils.textStartClick('开启服务');
                utils.textStartClick('确定');
            }
            sleep(60 * 1000 * 5);
        } else {
            toastLog("Z阅读已是最新版");
        }
    } catch (err) {
        toastLog(err);
    }
}

/**
 * 重启软件
 */
function reloadZreader() {
    readAppNum++;
    toastLog("已阅读的app个数：" + readAppNum + ",余数：" + (readAppNum % 4));
    if (readAppNum % 4 == 0) {  //每阅读四次重启App
        utils.autoservice('ztools');
        utils.launch('ztools');
        utils.toIndex('', '', '重启Z阅读', '');
        utils.textClick('重启Z阅读');
        sleep(1000 * 60 * 10);
    }
}

function upread() {
    var appName = '';
    var dir = "/sdcard/Download/";
    var appjson = "https://raw.githubusercontent.com/983183947/zreader_update/master/upztool.txt";
    var appjson = utils.http(appjson);
    if (appjson == "") {
        return;
    }
    toastLog("准备更新：" + appjson.appName + " " + appjson.version + " " + appjson.url);
    appName = appjson.appName;
    utils.xz(appName);
    files.removeDir(dir);
    files.ensureDir(dir);
    app.openUrl(appjson.url);
    sleep(3000);
    if (!!utils.text('打开方式')) {
        utils.textStartClick('下次默认选择此项');
        utils.textStartClick('浏览器');
        sleep(2000);
    } else {
        toastLog('用默认浏览器下载');
    }
    utils.textClick('立即下载');
    utils.textClick('确定');
    if (!utils.waitForText(['安装'], 50)) {
        var jsFiles = files.listDir(dir, function (name) {
            return name.startsWith(appName) && name.endsWith(".apk");
        });
        toastLog('准备安装' + dir + jsFiles[0]);
        app.viewFile(dir + jsFiles[0]);
        sleep(4000);
        if (utils.textClick('设置')) {
            utils.textStartClick('允许来自此来源');
            back();
        }
    }
    utils.textClick('安装');
    utils.waitForText(['完成'], 15);
    if (!utils.textClick('完成')) {
        upread();
    }
}

function wza() {
    try {
        var enabledServices = Settings.Secure.getString(context.getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES);
        var Services = enabledServices + ":com.stardust.auojs.inrt/com.stardust.autojs.core.accessibility.AccessibilityService";
        Settings.Secure.putString(context.getContentResolver(), Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES, Services);
        Settings.Secure.putString(context.getContentResolver(), Settings.Secure.ACCESSIBILITY_ENABLED, '1');
        toastLog("成功开启Z阅读的辅助服务");
    } catch (error) {
        //授权方法：开启usb调试并使用adb工具连接手机，执行 adb shell pm grant org.autojs.autojspro android.permission.WRITE_SECURE_SETTING
        toastLog("\n请确保已给予 WRITE_SECURE_SETTINGS 权限\n\n授权代码已复制，请使用adb工具连接手机执行(重启不失效)\n\n", error);
        // setClip("adb shell pm grant org.autojs.autojspro android.permission.WRITE_SECURE_SETTINGS");
    }
}
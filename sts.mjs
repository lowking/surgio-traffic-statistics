#!/usr/bin/env zx

let now = new Date();
let date = now.getTime();
const provider = `${process.argv[4]}`
let suffix = `${process.argv[5]}`
if (suffix == "undefined") {
    suffix = ''
}
const rootPath = `${process.argv[3]}/${provider}/${suffix}`
const domain = `${process.env.domain}`
await $`mkdir -p ${rootPath}`
const preDateFilePath = `${rootPath}/surgio-pre-data`;
const saveRetFilePath = `${rootPath}/surgio-query-result-${date}.log`;
let preDate, preData;
try {
    preDate = await fs.readJson(preDateFilePath);
} catch (e) {
    preDate = "";
}
const preDataPath = `${rootPath}/surgio-data-${preDate}`;
const targetPreDataPath = `${rootPath}/surgio-data-${date}`;
let preDataTime = "";
let preUpload = ``;
let preDownload = ``;
let preUsed = ``;
let preLeft = ``;
if (preDate) {
    preData = await fs.readJson(preDataPath);
    preUpload = `${preData.data.upload}`;
    preDownload = `${preData.data.download}`;
    preUsed = `${preData.data.used}`;
    preLeft = `${preData.data.left}`;
    preDataTime = `, ${formatTimeDuring(date - preDate)} since last time`;
}
let body = `{"accessToken":"${process.env.surgioPwd}"}`
let cookie = await $`curl -s -i '${domain}/api/auth' -H 'Proxy-Connection: keep-alive' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36' -H 'content-type: application/json' -H 'Accept: */*' -H 'Accept-Language: zh-CN,zh;q=0.9' --data-raw ${body} --compressed --insecure |grep "Set-Cookie" |head -n 1 |awk '{print $2}'`
let cookieHeader = 'Cookie: ' + cookie
let ret = await $`curl -s '${domain}/api/providers/${provider}/subscription' -H 'Proxy-Connection: keep-alive' -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.96 Safari/537.36' -H 'Accept: */*' -H 'Accept-Language: zh-CN,zh;q=0.9,zh-TW;q=0.8,en;q=0.7,ja;q=0.6' -H ${cookieHeader} --compressed --insecure`;
let obj = JSON.parse(ret);
if ("ok" == obj.status) {
    let upload = obj.data.upload;
    let download = obj.data.download;
    let used = obj.data.used;
    let left = obj.data.left;
    await $`touch ${targetPreDataPath}`;
    await fs.writeJson(targetPreDataPath, obj);
    await $`touch ${preDateFilePath}`;
    await fs.writeJson(preDateFilePath, date);
    try {
        await $`ls ${rootPath}/surgio-data-* |grep -v "${date}" |xargs rm -f`;
    } catch (e) {
        // do nothing
    }
    // await $`clear`

    let printStr = ``;
    printStr += `\nUpload\t: ${upload}`;
    let uploadArr = upload.split(" ");
    let preUploadArr = preUpload.split(" ");
    if (preUploadArr.length > 1) {
        printStr += ` - ${preUpload}（${fileLengthFormat(
            fileLengthFormat(uploadArr[0], uploadArr[1], true) -
                fileLengthFormat(preUploadArr[0], preUploadArr[1], true),
            ""
        )}）`;
    }
    printStr += `\nDownload: ${download}`;
    let downloadArr = download.split(" ");
    let preDownloadArr = preDownload.split(" ");
    if (preDownloadArr.length > 1) {
        printStr += ` - ${preDownload}（${fileLengthFormat(
            fileLengthFormat(downloadArr[0], downloadArr[1], true) -
                fileLengthFormat(preDownloadArr[0], preDownloadArr[1], true),
            ""
        )}）`;
    }
    printStr += `\nUsed\t: ${used}`;
    let usedArr = used.split(" ");
    let preUsedArr = preUsed.split(" ");
    if (preUsedArr.length > 1) {
        printStr += ` - ${preUsed}（${fileLengthFormat(
            fileLengthFormat(usedArr[0], usedArr[1], true) -
                fileLengthFormat(preUsedArr[0], preUsedArr[1], true),
            ""
        )}）`;
    }
    printStr += `\nLeft\t: ${left}`;
    let leftArr = left.split(" ");
    let preLeftArr = preLeft.split(" ");
    if (preLeftArr.length > 1) {
        printStr += ` - ${preLeft}（${fileLengthFormat(
            fileLengthFormat(preLeftArr[0], preLeftArr[1], true) -
                fileLengthFormat(leftArr[0], leftArr[1], true),
            ""
        )}）`;
    }

    let title = `Successed${preDataTime}! ${printStr}`
    echo(title);
    await fs.outputFile(
        saveRetFilePath,
        "\n\n" +
            timeFormat("yyyy-MM-dd HH:mm:ss", now.getTime()) +
            "\n" +
            title
    );
}

function timeFormat(fmt, ts = null) {
    const date = ts ? new Date(ts) : new Date();
    let o = {
        "M+": date.getMonth() + 1,
        "d+": date.getDate(),
        "H+": date.getHours(),
        "m+": date.getMinutes(),
        "s+": date.getSeconds(),
        "q+": Math.floor((date.getMonth() + 3) / 3),
        S: date.getMilliseconds(),
    };
    if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(
            RegExp.$1,
            (date.getFullYear() + "").substr(4 - RegExp.$1.length)
        );
    }
    for (let k in o) {
        if (new RegExp("(" + k + ")").test(fmt)) {
            fmt = fmt.replace(
                RegExp.$1,
                RegExp.$1.length == 1
                    ? o[k]
                    : ("00" + o[k]).substr(("" + o[k]).length)
            );
        }
    }
    return fmt;
}

function formatTimeDuring(total, n = 0) {
    total = Number(total);
    var unitArr = ["ms", "s", "min", "h", "d", "m", "y"];
    var scaleArr = [1000.0, 60.0, 60.0, 24.0, 30.0, 12.0, 100];
    var len = total;
    if (len > scaleArr[n]) {
        len = total / scaleArr[n];
        return formatTimeDuring(len, ++n);
    } else {
        return len.toFixed(2) + "" + unitArr[n];
    }
}

function fileLengthFormat(total, unit, toByte) {
    total = Number(total);
    var unitArr = ["", "KB", "MB", "GB", "TB", "PB", "EB", "ZB"];
    var n = 0;
    try {
        n = unitArr.indexOf(unit);
    } catch (e) {
        throw e;
    }
    if (toByte) {
        if (n == 0) {
            return total;
        }
        return fileLengthFormat(total * 1024, unitArr[--n], true);
    }
    var len = total;
    if (len > 1000) {
        len = total / 1024.0;
        return fileLengthFormat(len, unitArr[++n]);
    } else {
        if (n == 0) {
            return len.toFixed(2);
        }
        return len.toFixed(2) + " " + unitArr[n];
    }
}

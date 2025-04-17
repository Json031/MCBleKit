// 空字符串
function isEmptyStr(str) {
    return str === null || str === undefined || str === "";
}

// 空对象
function isNullObject(object) {
    return object === null || object === undefined;
}

// 含有子字符串
function contains(str, subStr) {
    if (isEmptyStr(str)) {
        return false;
    }
    if (isEmptyStr(subStr)) {
        return false;
    }
    return str.indexOf(subStr) >= 0;
}

// 忽略大小写敏感判断是否含有子字符串
function containsIgnoreCase(str, subStr) {
    return contains(str.toLowerCase(), subStr.toLowerCase());
}

// 忽略大小写敏感对比字符串
function isEqualIgnoreCase(str1, str2) {
    if (isEmptyStr(str1)) {
        return false;
    }
    if (isEmptyStr(str2)) {
        return false;
    }
    return str1.toUpperCase() === str2.toUpperCase();
}

function handleBluetoothError(err) {
    const code = err.errCode
    let message = '发生未知错误'
  
    const errorMap = {
      10000: '未初始化蓝牙适配器',
      10001: '当前蓝牙不可用',
      10002: '没有找到指定设备',
      10003: '连接失败',
      10004: '没有找到指定服务',
      10005: '没有找到指定特征值',
      10006: '当前连接已断开',
      10007: '当前特征值不支持此操作',
      10008: '其余所有系统上报的异常',
      10009: 'Android 系统特有，系统版本低于 4.3 不支持 BLE',
      10012: '连接超时',
      10013: '连接 deviceId 为空或者是格式不正确',
    }
  
    if (errorMap[code]) {
      message = errorMap[code]
    }
  
    wx.showToast({
      title: message,
      icon: 'none',
    })
  
    console.error('蓝牙错误:', code, message)
  }
  
module.exports = {
    isEmptyStr: isEmptyStr,
    contains: contains,
    isEqualIgnoreCase: isEqualIgnoreCase,
    isNullObject: isNullObject,
    containsIgnoreCase: containsIgnoreCase,
    handleBluetoothError: handleBluetoothError
};
/**
 * MCUtil.js.
 * MCBleKit
 * 
 * Created by Morgan Chen on 2025/4/8.
 * https://github.com/Json031
 */

/**
 * Determine if it is an empty string
 *
 * @param {string} str determine object
 *
 * @return {Boolean} true/false
 *
 */
function isEmptyStr(str) {
    return str === null || str === undefined || str === "";
}

/**
 * Determine if it is an empty object
 *
 * @param {object} object determine object
 *
 * @return {Boolean} true/false
 *
 */
function isNullObject(object) {
    return object === null || object === undefined;
}

/**
 * Determine if there are substrings present
 *
 * @param {string} str determine object
 * @param {string} subStr substrings
 *
 * @return {Boolean} true/false
 *
 */
function contains(str, subStr) {
    if (isEmptyStr(str)) {
        return false;
    }
    if (isEmptyStr(subStr)) {
        return false;
    }
    return str.indexOf(subStr) >= 0;
}

/**
 * Ignore case sensitivity to determine if there are substrings
 *
 * @param {string} str determine object
 * @param {string} subStr substrings
 *
 * @return {Boolean} true/false
 *
 */
function containsIgnoreCase(str, subStr) {
    return contains(str.toLowerCase(), subStr.toLowerCase());
}

/**
 * Ignore case sensitive comparison strings
 *
 * @param {string} str1 determine object
 * @param {string} sub2 determine object
 *
 * @return {Boolean} true/false
 *
 */
function isEqualIgnoreCase(str1, str2) {
    if (isEmptyStr(str1)) {
        return false;
    }
    if (isEmptyStr(str2)) {
        return false;
    }
    return str1.toUpperCase() === str2.toUpperCase();
}

/**
 * handle Bluetooth Error
 *
 * @param {object} err Bluetooth Error
 *
 */
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
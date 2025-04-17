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

module.exports = {
    isEmptyStr: isEmptyStr,
    contains: contains,
    isEqualIgnoreCase: isEqualIgnoreCase,
    isNullObject: isNullObject,
    containsIgnoreCase: containsIgnoreCase
};
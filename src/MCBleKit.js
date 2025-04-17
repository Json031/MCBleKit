var util = require('./MCUtil.js');
var __instance = (function () {
    var instance;
    return function (newInstance) {
        if (newInstance) instance = newInstance;
        return instance;
    };
})();

function MCBleKit() {
    //MTU最大传输单元（Maximum Transmission Unit）
    this.bleMTU = 169;
    //蓝牙名称
    this.blueName = "";
    //服务id，eg: ['1910','180A']
    this.serviceIds = [];

    // 连接中
    this.connecting = false;
    // 连接状态
    this.connected = false;
    // 服务列表
    this.services = [];
    // 是否弹出蓝牙提示
    this.blealert = false;
    // 发现的蓝牙外设列表
    this.devices = [];
    // 当前连接的蓝牙外设
    this.bleDevice = null;

    this.onBleCharacteristicValueReceivedListener = function () {};
    this.errorOccurListener = function () {};
    this.connectedStatusChangeListener = function () {};
    this.connectingStatusChangeListener = function () {};
    this.bluetoothDeviceFoundListener = function () {};
    this.stopDiscoverListener = function () {};
    this.startDiscoverListener = function () {};
    // 发现服务通知
    this.serviceListener = function () {};
    // 发现服务特征通知
    this.characteristicListener = function () {};
}

MCBleKit.prototype.onErrorOccured = function (errorOccurListener) {
    if (typeof errorOccurListener!== 'function') {
        errorOccurListener = function () {};
    }
    this.errorOccurListener = errorOccurListener;
};

MCBleKit.prototype.onConnectedStatusChange = function (connectedStatusChangeListener) {
    if (typeof connectedStatusChangeListener!== 'function') {
        connectedStatusChangeListener = function () {};
    }
    this.connectedStatusChangeListener = connectedStatusChangeListener;
};

MCBleKit.prototype.onConnectingStatusChange = function (connectingStatusChangeListener) {
    if (typeof connectingStatusChangeListener!== 'function') {
        connectingStatusChangeListener = function () {};
    }
    this.connectingStatusChangeListener = connectingStatusChangeListener;
};

MCBleKit.prototype.bluetoothDeviceFound = function (bluetoothDeviceFoundListener) {
    if (typeof bluetoothDeviceFoundListener!== 'function') {
        bluetoothDeviceFoundListener = function () {};
    }
    this.bluetoothDeviceFoundListener = bluetoothDeviceFoundListener;
};

MCBleKit.prototype.stopDiscover = function (stopDiscoverListener) {
    if (typeof stopDiscoverListener!== 'function') {
        stopDiscoverListener = function () {};
    }
    this.stopDiscoverListener = stopDiscoverListener;
};

MCBleKit.prototype.startDiscover = function (startDiscoverListener) {
    if (typeof startDiscoverListener!== 'function') {
        startDiscoverListener = function () {};
    }
    this.startDiscoverListener = startDiscoverListener;
};

MCBleKit.prototype.onServicesFound = function (serviceListener) {
    if (typeof serviceListener!== 'function') {
        serviceListener = function () {};
    }
    this.serviceListener = serviceListener;
};

MCBleKit.prototype.onCharacteristicFound = function (characteristicListener) {
    if (typeof characteristicListener!== 'function') {
        characteristicListener = function () {};
    }
    this.characteristicListener = characteristicListener;
};

Object.defineProperty(MCBleKit.prototype, 'connected', {
    set: function (value) {
        if (this._connected!== value) {
            this._connected = value;
            if (typeof this.connectedStatusChangeListener === 'function') {
                this.connectedStatusChangeListener(value);
            }
        }
    }
});

Object.defineProperty(MCBleKit.prototype, 'connecting', {
    set: function (value) {
        if (this._connecting!== value) {
            this._connecting = value;
            if (typeof this.connectingStatusChangeListener === 'function') {
                this.connectingStatusChangeListener(value);
            }
        }
    }
});

MCBleKit.getInstance = function (serviceIds, blueName) {
    if (serviceIds === undefined) {
        serviceIds = [];
    }
    if (__instance()) return __instance();
    var mcblekit = new MCBleKit();
    mcblekit.serviceIds = serviceIds;
    mcblekit.blueName = blueName;
    mcblekit.watchBleStatus();
    mcblekit.openBluetoothAdapter();
    mcblekit.onBLECharacteristicValueChange();
    return __instance(mcblekit);
};

MCBleKit.getSampleInstance = function (blueName) {
    return MCBleKit.getInstance([], blueName);
};

// 初始化蓝牙
MCBleKit.prototype.openBluetoothAdapter = function () {
    var that = this;
    wx.openBluetoothAdapter({
        success: function (res) {
            console.log('初始化蓝牙成功', res);
            that.startBluetoothDevicesDiscovery();
        },
        fail: function (res) {
            console.log('初始化蓝牙失败', res);
            that.errorOccurListener(res);
            if (util.containsIgnoreCase(res.errMsg, "already opened")) {
                that.getBluetoothAdapterState();
            } else {
                /**
                 * 初始化处理
                 */
                that.bleAlert();
            }
        }
    });
};

//获取蓝牙适配器状态
MCBleKit.prototype.getBluetoothAdapterState = function () {
    var that = this;
    wx.getBluetoothAdapterState({
        success: function (res) {
            if (res.adapterState!== undefined) {
                /**
                 * 开始扫描
                 */
                if (!res.adapterState.discovering &&!that.connected) {
                    console.log('available');
                }
                if (!res.adapterState.available) {
                    that.bleAlert();
                }
            } else if (res.discovering!== undefined) {
                /**
                 * 开始扫描
                 */
                if (!res.discovering &&!that.connected) {
                    console.log('available');
                }
                if (!res.available) {
                    that.bleAlert();
                }
            }
        },
        fail: function (res) {
            that.errorOccurListener(res);
        }
    });
    this.startBluetoothDevicesDiscovery();
};

// 开始扫描
MCBleKit.prototype.startBluetoothDevicesDiscovery = function () {
    if (util.isEmptyStr(this.blueName)) {
        return;
    }
    var that = this;
    wx.startBluetoothDevicesDiscovery({
        success: function (res) {
            that.onBluetoothDeviceFound();
            that.startDiscoverListener();
        },
        fail: function (res) {
            console.log('startBluetoothDevicesDiscovery fail' + res.errMsg);
        }
    });
};

//连接设备
// 获取所有已发现的设备
MCBleKit.prototype.onBluetoothDeviceFound = function () {
    var that = this;
    wx.onBluetoothDeviceFound(function (res) {
        var bluetoothDataList = that.devices;
        res.devices.forEach(function (item) {
            bluetoothDataList.push(item);
            if (util.isEqualIgnoreCase(item.localName, that.blueName)) {
                //连接
                that.bleDevice = item;
                that.stopBluetoothDevicesDiscovery();
                that.connectToBluetoothDevice();
            }
        });
        that.devices = bluetoothDataList;
        that.bluetoothDeviceFoundListener(that.devices);
    });
};

MCBleKit.prototype.stopBluetoothDevicesDiscovery = function () {
    var that = this;
    // 停止扫描
    wx.stopBluetoothDevicesDiscovery({
        success: function (res) {
            if (util.containsIgnoreCase(res.errMsg, 'ok')) {
                that.stopDiscoverListener();
            }
        },
        fail: function (res) {
            that.errorOccurListener(res);
        }
    });
};

MCBleKit.prototype.connectToBluetoothDevice = function () {
    if (util.isNullObject(this.bleDevice)) {
        return;
    }
    if (this.connected) {
        return;
    }
    if (this.connecting) {
        return;
    }
    this.connecting = true;
    // 连接外设
    var that = this;
    wx.createBLEConnection({
        deviceId: this.bleDevice.deviceId,
        success: function (res) {
            console.log('连接成功', res);
            that.connected = true;
            wx.setBLEMTU({
                deviceId: that.bleDevice.deviceId,
                mtu: that.bleMTU,
                success: function (res) {
                    console.log('setBLEMTU succ');
                },
                fail: function (err) {
                    that.errorOccurListener(err);
                    console.log('setBLEMTU fail' + JSON.stringify(err));
                }
            });
            that.getBLEDeviceServices();
        },
        fail: function (res) {
            if (res.errno == 1509001 && res.errCode == 10003 && util.containsIgnoreCase(res.errMsg, 'status:133')) {
                wx.openBluetoothAdapter({
                    success: function (res) {
                        console.log('初始化蓝牙成功', res);
                        var coTimer = setInterval(function () {
                            that.connectToBluetoothDevice();
                            clearInterval(coTimer);
                        }, 1000);
                    },
                    fail: function (res) {
                        that.errorOccurListener(res);
                        console.log('初始化蓝牙失败', res);
                    }
                });
                return;
            }
            if (res.errno == 1509007) {
                that.getBLEDeviceServices();
            }
            console.log('连接失败', res);
            //超时情况不提示
            if (!util.containsIgnoreCase(res.errMsg, 'connect time out')) {
                that.errorOccurListener(res);
                wx.showToast({
                    title: '连接失败:' + res.errno,
                    icon: 'none'
                });
            }
        }
    });
};

/**
 * 获取Services
 */
MCBleKit.prototype.getBLEDeviceServices = function () {
    // 获取service
    var that = this;
    wx.getBLEDeviceServices({
        deviceId: this.bleDevice.deviceId,
        success: function (res) {
            that.services = res.services;
            that.serviceListener(res.services);
            for (var i = 0; i < res.services.length; i++) {
                if (that.serviceIds.length <= 0) {
                    //未指定serviceId，全部获取
                    that.getBLEDeviceCharacteristics(res.services[i].uuid);
                } else {
                    //指定serviceId
                    for (var j = 0; j < that.serviceIds.length; j++) {
                        if (util.containsIgnoreCase(res.services[i].uuid, that.serviceIds[j])) {
                            that.getBLEDeviceCharacteristics(res.services[i].uuid);
                            break;
                        }
                    }
                }
            }
        },
        fail: function (res) {
            if (res.errCode == 10004) {
                wx.showModal({
                    // title: '系统未获取到蓝牙服务，是否重试？',
                    title: '系统未获取到蓝牙服务，请尝试关闭蓝牙并重启后再试',
                    showCancel: false,
                    content: '',
                    complete: function (res) {
                        if (res.cancel) {

                        }

                        if (res.confirm) {
                            that.globalData.connecting = false;
                            wx.closeBLEConnection({
                                deviceId: that.globalData.deviceId,
                                success: function (res) {},
                                fail: function (res) {}
                            });
                        }
                    }
                });
            } else {
                that.errorOccurListener(res);
                wx.showToast({
                    title: '系统获取蓝牙服务失败' + res.errCode,
                    icon: 'none'
                });
            }
        }
    });
};

// 获取characteristic
MCBleKit.prototype.getBLEDeviceCharacteristics = function (serviceId) {
    var that = this;
    wx.getBLEDeviceCharacteristics({
        deviceId: this.bleDevice.deviceId,
        serviceId: serviceId,
        success: function (res) {
            /**
             * 获取characteristics
             */
            that.characteristicListener(serviceId, res);
        },
        fail: function (res) {
            that.errorOccurListener(res);
            console.log("getBLEDeviceCharacteristics fail", res);
        }
    });
};

MCBleKit.prototype.notifyBLECharacteristicValueChange = function (serviceId, notifyCharacteristicsId) {
    // notify characteristic
    var that = this;
    wx.notifyBLECharacteristicValueChange({
        state: true,
        deviceId: this.bleDevice.deviceId,
        serviceId: serviceId,
        characteristicId: notifyCharacteristicsId,
        type: 'notification',
        success: function (res) {
            if (res.errCode == 0) {
                console.log("notifyBLECharacteristic success");
            } else {
                wx.showToast({
                    title: res.errMsg,
                    icon: 'none'
                });
            }
        },
        fail: function (res) {
            that.errorOccurListener(res);
        }
    });
};

MCBleKit.prototype.readCharacteristicValue = function (serviceId, characteristicId) {
    wx.readBLECharacteristicValue({
        deviceId: this.bleDevice.deviceId,
        serviceId: serviceId,
        characteristicId: characteristicId,
        success: function (res) {
            console.log('readBLECharacteristicValue:', res);
        }
    });
};

MCBleKit.prototype.onBleCharacteristicValueReceived = function (onBleCharacteristicValueReceivedListener) {
    if (typeof onBleCharacteristicValueReceivedListener!== 'function') {
        onBleCharacteristicValueReceivedListener = function () {};
    }
    this.onBleCharacteristicValueReceivedListener = onBleCharacteristicValueReceivedListener;
};

MCBleKit.prototype.onBLECharacteristicValueChange = function () {
    var that = this;
    wx.onBLECharacteristicValueChange(function (res) {
        that.onBleCharacteristicValueReceivedListener(res);
    });
};

// 断开连接
MCBleKit.prototype.closeBLEConnection = function () {
    var that = this;
    this.stopBluetoothDevicesDiscovery();
    wx.closeBLEConnection({
        deviceId: this.bleDevice.deviceId,
        success: function (res) {
            console.log('断开连接成功', res);
        },
        fail: function (res) {
            that.errorOccurListener(res);
            console.log('断开连接失败', res);
        }
    });
    this.connecting = false;
    this.connected = false;
    this.blueName = "";
    this.services = [];
    this.blealert = false;
    this.devices = [];
    this.bleDevice = null;
    this.serviceIds = [];
};

// 监听蓝牙状态
MCBleKit.prototype.watchBleStatus = function () {
    var that = this;
    wx.onBLEConnectionStateChange(function (result) {
        if (!result.connected) {
            that.connecting = false;
            that.connected = false;
        } else {
            that.connected = result.connected;
        }
    });
    wx.onBluetoothAdapterStateChange(function (res) {
        if (that.connected &&!res.available) {
            that.connected = false;
        }
        if (!that.connected) {
            that.connecting = false;
        }
    });
};

//蓝牙不可用友情提示
MCBleKit.prototype.bleAlert = function () {
    var that = this;
    if (!this.blealert) {
        //设置已弹框提示开启蓝牙
        this.blealert = true;
        wx.showModal({
            title: '提示',
            content: '请您打开蓝牙或检查微信是否授权蓝牙，用于连接设备',
            confirmColor: '#00b6b5',
            showCancel: false,
            success: function (res) {
                //设置未弹框提示开启蓝牙
                that.blealert = false;
            }
        });
        var myTimer = setInterval(function () {
            //设置未弹框提示开启蓝牙
            that.blealert = false;
            clearInterval(myTimer);
        }, 3000);
    }
};

//数据交互,
MCBleKit.prototype.writeValue = function (data, writeType, serviceId, characteristicsId) {
    // OTA发送
    var that = this;
    wx.writeBLECharacteristicValue({
        deviceId: this.bleDevice.deviceId,
        serviceId: serviceId,
        characteristicId: characteristicsId,
        value: data,
        writeType: writeType,
        success: function (res) {
            console.log('写入成功', res);
        },
        fail: function (res) {
            console.log('发送失败' + res.errMsg);
            if (res.errCode == 10006) {
                that.getBluetoothAdapterState();
            } else {
                that.closeBLEConnection();
            }
        }
    });
};

module.exports = MCBleKit;
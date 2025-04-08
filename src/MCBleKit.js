const util = require('./MCUtil.js')
let __instance = (() => {
    let instance;
    return (newInstance) => {
        if (newInstance) instance = newInstance;
        return instance;
    }
})();

class MCBleKit {
    //MTU最大传输单元（Maximum Transmission Unit）
    bleMTU = 169
    //蓝牙名称
    blueName = ""
    //服务id，eg: ['1910','180A']
    serviceIds = []

    // 连接中
    connecting = false
    // 连接状态
    connected = false
    // 服务列表
    services = []
    // 是否弹出蓝牙提示
    blealert = false
    // 发现的蓝牙外设列表
    devices = []
    // 当前连接的蓝牙外设
    bleDevice = null
    
    onBleCharacteristicValueReceivedListener = () => {};
    errorOccurListener = () => {};

    onErrorOccured(errorOccurListener = () => {}) {
        this.errorOccurListener = errorOccurListener
    }
    connectedStatusChangeListener = () => {};

    onConnectedStatusChange(connectedStatusChangeListener = () => {}) {
        this.connectedStatusChangeListener = connectedStatusChangeListener
    }
    connectingStatusChangeListener = () => {};

    onConnectingStatusChange(connectingStatusChangeListener = () => {}) {
        this.connectingStatusChangeListener = connectingStatusChangeListener
    }
    bluetoothDeviceFoundListener = () => {};

    bluetoothDeviceFound(bluetoothDeviceFoundListener = () => {}) {
        this.bluetoothDeviceFoundListener = bluetoothDeviceFoundListener
    }
    stopDiscoverListener = () => {};

    stopDiscover(stopDiscoverListener = () => {}) {
        this.stopDiscoverListener = stopDiscoverListener
    }
    startDiscoverListener = () => {};

    startDiscover(startDiscoverListener = () => {}) {
        this.startDiscoverListener = startDiscoverListener
    }
    // 发现服务通知
    serviceListener = () => {};
    // 发现服务特征通知
    characteristicListener = () => {};

    /**
     * 发现服务通知
     *
     * @param {Function} serviceListener the service call back.
     *
     * @return 
     */
    onServicesFound(serviceListener = () => {}) {
        this.serviceListener = serviceListener
    }
    
    /**
     * 发现服务特征通知
     *
     * @param {Function} characteristicListener the characteristic call back.
     *
     * @return 
     */
    onCharacteristicFound(characteristicListener = () => {}) {
        this.characteristicListener = characteristicListener
    }

    /**
     * 定义 services 的 setter
     *
     * @param {Array} value the services of bluetooth.
     *
     * @return 
     */
    set services(value) {
        if (this._services!== value) {
            this._services = value;
            // 调用 serviceListener 并传入新的 services 值
            // 检查 serviceListener 是否为函数
            if (typeof this.serviceListener === 'function') {
                this.serviceListener(value);
            }
        }
    }
    set connected(value) {
        if (this._connected!== value) {
            this._connected = value;
            // 调用 serviceListener 并传入新的 connected 值
            // 检查 serviceListener 是否为函数
            if (typeof this.connectedStatusChangeListener === 'function') {
                this.connectedStatusChangeListener();
            }
        }
    }
    set connecting(value) {
        if (this._connecting!== value) {
            this._connecting = value;
            // 调用 serviceListener 并传入新的 connecting 值
            // 检查 serviceListener 是否为函数
            if (typeof this.connectingStatusChangeListener === 'function') {
                this.connectingStatusChangeListener();
            }
        }
    }
    /**
     * MCBleKit instance with serviceIds and bluetooth name.
     *
     * @param {Array} serviceIds the services id of bluetooth ed:['018A', '9823'].
     * @param {string} blueName bluetooth name.
     *
     * @return {MCBleKit} The instance of MCBleKit class.
     */
    static getInstance(serviceIds = [], blueName) {
        if (__instance()) return __instance();
        var mcblekit = new MCBleKit()
        mcblekit.serviceIds = serviceIds;
        mcblekit.blueName = blueName;
        mcblekit.watchBleStatus()
        mcblekit.openBluetoothAdapter()
        mcblekit.onBLECharacteristicValueChange()
        return __instance(mcblekit);
    }
  
    /**
     * MCBleKit instance with bluetooth name.
     *
     * @param {string} blueName bluetooth name.
     *
     * @return {MCBleKit} The instance of MCBleKit class.
     */
    static getSampleInstance(blueName) {
        return MCBleKit.getInstance([], blueName)
    }
  
      // 初始化蓝牙
    openBluetoothAdapter() {  
      const that = this;  
      wx.openBluetoothAdapter({  
        success: function (res) {  
          console.log('初始化蓝牙成功', res)  
          that.startBluetoothDevicesDiscovery()
        },  
        fail: function (res) {  
          console.log('初始化蓝牙失败', res)  
          that.errorOccurListener(res)
          if (util.containsIgnoreCase(res.errMsg, "already opened")) {
            that.getBluetoothAdapterState() 
          }  else {
              /**
               * 初始化处理
               */
              that.bleAlert()
          }
        }  
      })  
    }
    //获取蓝牙适配器状态
    getBluetoothAdapterState() {
      // 状态处理
        var that = this;
        wx.getBluetoothAdapterState({
            success: function(res) {
                if (res.adapterState != undefined) {
                  /**
                   * 开始扫描
                   */
                    if (!res.adapterState.discovering && !that.connected) {
                      console.log('available')
                    }
                    if (!res.adapterState.available) {
                      that.bleAlert()
                    }
                } else if (res.discovering != undefined) {
                  /**
                   * 开始扫描
                   */
                    if (!res.discovering && !that.connected) {
                      console.log('available')
                    }
                    if (!res.available) {
                      that.bleAlert()
                    }
                }
            },
            fail: function(res) {
                that.errorOccurListener(res)
            }
        });
        this.startBluetoothDevicesDiscovery();
    }
    // 开始扫描
    startBluetoothDevicesDiscovery() {  
        if (util.isEmptyStr(this.blueName)) {
            return
        }
        const that = this;  
        wx.startBluetoothDevicesDiscovery({  
            success: function (res) {  
                that.onBluetoothDeviceFound();
                that.startDiscoverListener()
            },  
            fail: function (res) {  
                console.log('startBluetoothDevicesDiscovery fail' + res.errMsg)  
            }  
        })
    }
    //连接设备
    // 获取所有已发现的设备
    onBluetoothDeviceFound() {
        var that = this;
        wx.onBluetoothDeviceFound((res) => {
            var bluetoothDataList = that.devices; 
            res.devices.forEach(item => {
                bluetoothDataList.push(item);
                if (util.isEqualIgnoreCase(item.localName, that.blueName)) {
                    //连接
                    that.bleDevice = item
                    that.stopBluetoothDevicesDiscovery();
                    that.connectToBluetoothDevice();
                }
            })
            that.devices = bluetoothDataList
            that.bluetoothDeviceFoundListener();

        })
    }
    stopBluetoothDevicesDiscovery() {  
        const that = this
        // 停止扫描
        wx.stopBluetoothDevicesDiscovery({  
        success: function (res) {  
            if (util.containsIgnoreCase(res.errMsg, 'ok')) {
                that.stopDiscoverListener()
            }
        },  
        fail: function (res) {  
            that.errorOccurListener(res)
        }  
        })  
    }
    connectToBluetoothDevice() {  
        if (util.isNullObject(this.bleDevice)) {
            return
        }
        if (this.connected) {
            return
        }
        if (this.connecting) {
            return
        }
        this.connecting = true
        // 连接外设
        const that = this;  
        wx.createBLEConnection({  
        deviceId: this.bleDevice.deviceId,  
        success: function (res) {  
            console.log('连接成功', res)
            that.connected = true
            wx.setBLEMTU({
            deviceId: that.bleDevice.deviceId,
            mtu: that.bleMTU,
            success: function(res) {
                console.log('setBLEMTU succ')
            },
            fail: function(err) {
                that.errorOccurListener(err)
                console.log('setBLEMTU fail' + JSON.stringify(err))
            }
            })
            that.getBLEDeviceServices()
        },  
        fail: function (res) {  
            if (res.errno == 1509001 && res.errCode == 10003 && util.containsIgnoreCase(res.errMsg, 'status:133')) {
            wx.openBluetoothAdapter({  
                success: function (res) {  
                console.log('初始化蓝牙成功', res)
                var coTimer = setInterval(()=>
                {
                    that.connectToBluetoothDevice()
                    clearInterval(coTimer)
                }, 1000)
                },  
                fail: function (res) {  
                    that.errorOccurListener(res)
                    console.log('初始化蓝牙失败', res)
                }  
            })
            return
            }
            if (res.errno == 1509007) {
                that.getBLEDeviceServices()
            }
            console.log('连接失败', res)  
            //超时情况不提示
            if (!util.containsIgnoreCase(res.errMsg, 'connect time out')) {
                that.errorOccurListener(res)
                wx.showToast({
                title: '连接失败:' + res.errno,
                icon:'none'
                })
            }
        }  
        })  
    }
    /**
     * 获取Services
     */
    getBLEDeviceServices() {  
        // 获取service
        var that = this;
        wx.getBLEDeviceServices({
            deviceId: this.bleDevice.deviceId,
            success: function (res) {
            that.services = res.services
            for (var i = 0; i < res.services.length; i++) {
                if (that.serviceIds.length <= 0) {
                    //未指定serviceId，全部获取
                    that.getBLEDeviceCharacteristics(res.services[i].uuid)
                } else {
                    //指定serviceId
                    for (var i = 0; i < that.serviceIds.length; i++) {
                        if (util.containsIgnoreCase(res.services[i].uuid, that.serviceIds[i])) {
                            that.getBLEDeviceCharacteristics(res.services[i].uuid)
                            break
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
                    complete: (res) => {
                    if (res.cancel) {
                        
                    }
                
                    if (res.confirm) {
                        that.globalData.connecting = false
                        wx.closeBLEConnection({
                        deviceId: that.globalData.deviceId,
                        success: function (res) {
                        },fail:function (res) {
                        }
                        })
                    }
                    }
                })
            } else {
                    that.errorOccurListener(res)
                    wx.showToast({
                    title: '系统获取蓝牙服务失败' + res.errCode,
                    icon:'none'
                    })
            }
        }
        })
    }
    
    // 获取characteristic
    getBLEDeviceCharacteristics(serviceId) {
        var that = this;
        wx.getBLEDeviceCharacteristics({
        deviceId: this.bleDevice.deviceId,
        serviceId: serviceId,
        success: function (res) {
            /**
             * 获取characteristics
             */
            that.characteristicListener(serviceId, res)
        },
        fail: function (res) {
            that.errorOccurListener(res)
            console.log("getBLEDeviceCharacteristics fail", res);
        },
    
        })
    
    }
    notifyBLECharacteristicValueChange(serviceId, notifyCharacteristicsId) {
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
                console.log("notifyBLECharacteristic success")
            } else {
                wx.showToast({
                title: res.errMsg,
                icon:'none'
                })
            }
        },
        fail: function (res) {
            that.errorOccurListener(res)
        },
        })
    }
    readCharacteristicValue(serviceId, characteristicId) {
        wx.readBLECharacteristicValue({
          deviceId:this.bleDevice.deviceId,
          serviceId: servicweId,
          characteristicId: characteristicsId,
          success (res) {
            console.log('readBLECharacteristicValue:', res)
          }
        })
    }
    
    onBleCharacteristicValueReceived(onBleCharacteristicValueReceivedListener = () => {}) {
        this.onBleCharacteristicValueReceivedListener = onBleCharacteristicValueReceivedListener
    }
    onBLECharacteristicValueChange() {
        var that = this
        wx.onBLECharacteristicValueChange(function(res) {
            that.onBleCharacteristicValueReceivedListener(res)
        })
    }
    
    // 断开连接
    closeBLEConnection() {  
        const that = this
        this.stopBluetoothDevicesDiscovery()
        wx.closeBLEConnection({  
        deviceId: this.bleDevice.deviceId,  
        success: function (res) {  
            console.log('断开连接成功', res)  
        },  
        fail: function (res) {  
            that.errorOccurListener(res)
            console.log('断开连接失败', res)  
        }  
        })  
        connecting = false
        connected = false
        blueName = ""
        services = []
        blealert = false
        devices = []
        bleDevice = null
        serviceIds = []
    }
    // 监听蓝牙状态
    watchBleStatus() {
        const that = this;  
        wx.onBLEConnectionStateChange((result) => {
            if (!result.connected) {
                that.connecting = false
                that.connected = false
            } else {
                that.connected = result.connected
            }
        })
        wx.onBluetoothAdapterStateChange(function (res) {
            if (that.connected && !res.available) {
                that.connected = false
            }
            if (!that.connected) {
                that.connecting = false
            }
          })
    }
    //蓝牙不可用友情提示
    bleAlert() {
        const that = this
      if (!this.blealert) {
          //设置已弹框提示开启蓝牙
          this.blealert = true
          wx.showModal({
              title: '提示',
              content: '请您打开蓝牙或检查微信是否授权蓝牙，用于连接设备',
              confirmColor: '#00b6b5',
              showCancel: false,
              success(res) {
                  //设置未弹框提示开启蓝牙
                  that.blealert = false
              }
          })
          var myTimer = setInterval(()=>
          {
              //设置未弹框提示开启蓝牙
              this.blealert = false
              clearInterval(myTimer)
          }, 3000)
      }
    }

    //数据交互,
    writeValue(data, writeType, serviceId, characteristicsId) {
        // OTA发送
        const that = this
        wx.writeBLECharacteristicValue({  
        deviceId: this.bleDevice.deviceId, 
        serviceId: serviceId, 
        characteristicId: characteristicsId, 
        value: data, 
        writeType: writeType,
        success: function(res) {  
            console.log('写入成功', res);  
        },  
        fail: function(res) { 
            console.log('发送失败' + res.errMsg)
            if (res.errCode == 10006) {
                that.getBluetoothAdapterState()
            } else {
                that.closeBLEConnection()
            }
        }  
        });
    }
    

}
module.exports = MCBleKit;
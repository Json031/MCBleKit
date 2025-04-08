# MCBleKit
该微信小程序开源代码库用于管理微信小程序中的蓝牙功能。支持初始化蓝牙适配器、扫描和连接蓝牙设备、获取设备服务和特征、监听特征值变化、读写特征值以及断开连接等操作。通过设置不同的监听器，可灵活处理蓝牙连接状态变化、设备发现、服务和特征发现等事件，适用于需要与蓝牙设备进行数据交互的微信小程序开发场景。This WeChat mini program open-source code library is used to manage the Bluetooth function in WeChat mini programs. Support initialization of Bluetooth adapters, scanning and connecting Bluetooth.

# 安装Install
### 编辑package.json，添加mcblekit依赖。 Edit packagejson and add mcblekit dependency:：
 ```bash
{
  "dependencies": {
    "mcblekit": "latest"
  }
}
   ```
### 在小程序 package.json 所在的目录中执行命令安装 npm 包。 Execute the command to install the npm package in the directory where the mini program packagejson is located：
 ```bash
cd /the/path/to/package.json file/
npm install
   ```
### 在引用蓝牙管理类的js内引入 mcblekit 的模块，并将该模块的导出内容赋值给变量 MCBleKit. Introduce the mcblekit module into the JS that references the Bluetooth management class, and assign the exported content of this module to the variable MCBleKit.

 ```bash
const MCBleKit = require('mcblekit')
   ```
### 示例代码Example code:：
 ```bash
    var mcblekit = MCBleKit.getSampleInstance("YOUR_BLUETOOTH_NAME")
    mcblekit.onCharacteristicFound((serviceId, res) => {
        console.log(`发现服务 ${serviceId} 的特征:`, res.characteristics);
    });
    mcblekit.onServicesFound((services) => {
        for (var i = 0; i < services.length; i++) {
            console.log(`发现服务 ${services[i].uuid}`);
        }
    });
    mcblekit.bluetoothDeviceFound(() => {
        console.log('bluetoothDeviceFound:' + mcblekit.devices[mcblekit.devices.length - 1].name);
    });
   ```
![image](https://github.com/user-attachments/assets/a023a2c2-0708-4a42-a2b3-f013f8b53f5c)


# 许可证 License
This library is licensed under the [MIT License](https://github.com/Json031/MCBleKit/blob/main/LICENSE).

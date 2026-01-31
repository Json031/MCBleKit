# MCBleKit
<a name="top"></a>

[![NPM version](https://img.shields.io/npm/v/mcblekit.svg)](https://www.npmjs.com/package/mcblekit)
![JavaScript](https://img.shields.io/badge/JavaScript-ES5+-yellow.svg)
[![License](https://img.shields.io/badge/license-MIT-brightgreen.svg)](https://github.com/Json031/MCBleKit/blob/main/LICENSE)

---

## 🌍 Language / 语言选择

**[English](#english)** | **[中文](#中文)**

---

## 📖 English
<a name="english"></a>

### Overview

This WeChat mini program open-source project code library is used to manage Bluetooth functionality in WeChat mini programs. It supports initialization of Bluetooth adapters, scanning and connecting Bluetooth devices, obtaining device services and characteristics, monitoring characteristic value changes, reading and writing characteristic values, and disconnecting operations. By setting different listeners, you can flexibly handle Bluetooth connection status changes, device discovery, service and characteristic discovery events, making it suitable for WeChat mini program development scenarios that require data interaction with Bluetooth devices.

### Installation

**Latest Version:** `latest`

#### Step 1: Add MCBleKit Dependency

Edit `package.json` and add the mcblekit dependency:

```json
{
  "dependencies": {
    "mcblekit": "latest"
  }
}
```

#### Step 2: Install NPM Package

Execute the command to install the npm package in the directory where the mini program `package.json` is located:

```bash
cd /the/path/to/package.json/file/
npm install
```

### Usage Example

Import the mcblekit module into the JS file that references the Bluetooth management class, and assign the exported content of this module to the variable `MCBleKit`:

```javascript
const MCBleKit = require('mcblekit')
```

#### Complete Example Code

```javascript
var writeServiceId = '108A' // Write property service identifier
var writeCharacteristicsId = '909C' // Write property Characteristic identifier
var serviceId = null
var characteristicsId = null
var mcblekit = MCBleKit.getSampleInstance("YOUR_BLUETOOTH_NAME")

mcblekit.onCharacteristicFound((serviceId, res) => {
    for (var i = 0; i < res.characteristics.length; i++) {
        if (res.characteristics[i].uuid.toUpperCase().indexOf(writeCharacteristicsId.toUpperCase()) >= 0) {
            characteristicsId = res.characteristics[i].uuid
            // Find the write Characteristic and start writing data
            // Determine if it is connected
            if (mcblekit.connected) {
                // Send data - write data Value
                let buffer = new ArrayBuffer(2);
                let view = new DataView(buffer);
                view.setUint8(0, 0x0A);
                view.setUint8(1, 0x01);
                mcblekit.writeValue(buffer, 'writeNoResponse', serviceId, characteristicsId)
            }
            break
        }
    }
    console.log(`Found characteristics for service ${serviceId}:`, res.characteristics);
});

mcblekit.onServicesFound((services) => {
    for (var i = 0; i < services.length; i++) {
        if (services[i].uuid.toUpperCase().indexOf(writeServiceId.toUpperCase()) >= 0) {
            serviceId = services[i].uuid
            break
        }
        console.log(`Found service ${services[i].uuid}`);
    }
});

mcblekit.bluetoothDeviceFound(() => {
    console.log('bluetoothDeviceFound:' + mcblekit.devices[mcblekit.devices.length - 1].name);
});

mcblekit.onConnectedStatusChange((connected) => {
    console.log('onConnectedStatusChange:' + (connected ? "connected" : "disconnected"));
});
```

### Console Output

![console log](https://github.com/user-attachments/assets/492cef49-f311-4a54-a2f0-7fbb5a4457de)

### License

This library is licensed under the [MIT License](https://github.com/Json031/MCBleKit/blob/main/LICENSE).

---

## 📖 中文
<a name="中文"></a>

### 项目简介

该微信小程序开源项目代码库用于管理微信小程序中的蓝牙功能。支持初始化蓝牙适配器、扫描和连接蓝牙设备、获取设备服务和特征、监听特征值变化、读写特征值以及断开连接等操作。通过设置不同的监听器，可灵活处理蓝牙连接状态变化、设备发现、服务和特征发现等事件，适用于需要与蓝牙设备进行数据交互的微信小程序开发场景。

### 安装

**最新版本：** `latest`

#### 步骤 1：添加 MCBleKit 依赖

编辑 `package.json`，添加 mcblekit 依赖：

```json
{
  "dependencies": {
    "mcblekit": "latest"
  }
}
```

#### 步骤 2：安装 NPM 包

在小程序 `package.json` 所在的目录中执行命令安装 npm 包：

```bash
cd /the/path/to/package.json/file/
npm install
```

### 使用示例

在引用蓝牙管理类的 JS 内引入 mcblekit 的模块，并将该模块的导出内容赋值给变量 `MCBleKit`：

```javascript
const MCBleKit = require('mcblekit')
```

#### 完整示例代码

```javascript
var writeServiceId = '108A' // 写入属性服务标识符
var writeCharacteristicsId = '909C' // 写入属性特征标识符
var serviceId = null
var characteristicsId = null
var mcblekit = MCBleKit.getSampleInstance("YOUR_BLUETOOTH_NAME")

mcblekit.onCharacteristicFound((serviceId, res) => {
    for (var i = 0; i < res.characteristics.length; i++) {
        if (res.characteristics[i].uuid.toUpperCase().indexOf(writeCharacteristicsId.toUpperCase()) >= 0) {
            characteristicsId = res.characteristics[i].uuid
            // 找到写入特征，开始写入数据
            // 判断是否已连接
            if (mcblekit.connected) {
                // 发送数据
                let buffer = new ArrayBuffer(2);
                let view = new DataView(buffer);
                view.setUint8(0, 0x0A);
                view.setUint8(1, 0x01);
                mcblekit.writeValue(buffer, 'writeNoResponse', serviceId, characteristicsId)
            }
            break
        }
    }
    console.log(`发现服务 ${serviceId} 的特征:`, res.characteristics);
});

mcblekit.onServicesFound((services) => {
    for (var i = 0; i < services.length; i++) {
        if (services[i].uuid.toUpperCase().indexOf(writeServiceId.toUpperCase()) >= 0) {
            serviceId = services[i].uuid
            break
        }
        console.log(`发现服务 ${services[i].uuid}`);
    }
});

mcblekit.bluetoothDeviceFound(() => {
    console.log('bluetoothDeviceFound:' + mcblekit.devices[mcblekit.devices.length - 1].name);
});

mcblekit.onConnectedStatusChange((connected) => {
    console.log('onConnectedStatusChange:' + (connected ? "connected" : "disconnected"));
});
```

### 控制台输出

![console log](https://github.com/user-attachments/assets/492cef49-f311-4a54-a2f0-7fbb5a4457de)

### 许可证

本项目基于 [MIT License](https://github.com/Json031/MCBleKit/blob/main/LICENSE) 开源协议。

---

**[⬆ Back to Top / 返回顶部](#top)**

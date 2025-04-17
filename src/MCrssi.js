/**
 * MCrssi.js.
 * MCBleKit
 * 
 * Created by Morgan Chen on 2025/4/17.
 * https://github.com/Json031
 */

/**
 * get Bluetooth Device RSSI
 *
 * @param {string} deviceId Bluetooth device id
 *
 * @return {number} RSSI value
 */
function getDeviceRSSI(deviceId) {
    return new Promise((resolve, reject) => {
      wx.getBLEDeviceRSSI({
        deviceId,
        success(res) {
          console.log(`📶 当前设备 RSSI: ${res.RSSI}`)
          resolve(res.RSSI)
        },
        fail(err) {
          console.error('❌ 获取 RSSI 失败', err)
          reject(err)
        }
      })
    })
  }
  
module.exports = {
    getDeviceRSSI: getDeviceRSSI
};
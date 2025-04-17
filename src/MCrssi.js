// MCrssi.js
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
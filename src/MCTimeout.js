/**
 * MCTimeout.js.
 * MCBleKit
 * 
 * Created by Morgan Chen on 2025/4/17.
 * https://github.com/Json031
 */

/**
 * Creates a timeout for function's promise.
 *
 * @param {function} promise function's promise.
 *
 * @param {timeoutMs} timeoutMs timeout milliseconds.
 * 
 * @param {string} timeoutMessage timeout message.
 *
 * @return {Promise} new Promise
 *
 */
function withTimeout(promise, timeoutMs, timeoutMessage = '操作超时') {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(timeoutMessage))
      }, timeoutMs)
  
      promise
        .then((res) => {
          clearTimeout(timer)
          resolve(res)
        })
        .catch((err) => {
          clearTimeout(timer)
          reject(err)
        })
    })
  }
  
module.exports = {
    withTimeout: withTimeout
};
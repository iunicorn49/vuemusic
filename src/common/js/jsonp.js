/**
 * Created by zlk on 2018/1/3.
 * 封装 JSONP
 */
import orginJSONP from 'jsonp'
// 对外暴露这个方法
export default function jsonp(url, data, options) {
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)
  return new Promise((resolve, reject) => {
    orginJSONP(url, options, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    }) // orginJSONP end
  }) // return end
}

function param(data) {
  let url = ''
  for (var k in data) {
    let value = data[k] !== undefined ? data[k] : ''
    url += `&${k}=${encodeURIComponent(value)}` // 拼接地址
  } // for in end
  return url ? url.substring(1) : ''
}

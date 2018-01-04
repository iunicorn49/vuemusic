/**
 * Created by zlk on 2018/1/3.
 * 封装 JSONP
 */
import orginJSONP from 'jsonp'
// 对外暴露这个方法,原来的方法并不支持拼接参数,自己基于这个包再来封装一次, url:请求地址,data:后续参数,options:配置项
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
    // 有时候参数会是一个undefined,此时转为空字符串更加严谨
    let value = data[k] !== undefined ? data[k] : ''
    url += `&${k}=${encodeURIComponent(value)}` // 拼接地址
  } // for in end
  // 第一个参数不需要 '&' 直接切掉
  return url ? url.substring(1) : ''
}


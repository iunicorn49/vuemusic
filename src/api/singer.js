/**
 * Created by zlk on 2018/1/10.
 */
import jsonp from 'common/js/jsonp'
import {commonParams, options} from './config' // config 暴露了多个常量, 所以用 {}

export function getSingerList() {
  const url = 'https://c.y.qq.com/v8/fcg-bin/v8.fcg'
  const data = Object.assign({}, commonParams, {
    channel: 'singer',
    page: 'list',
    key: 'all_all_all',
    pagesize: 100,
    pagenum: 1,
    hostUin: 0,
    needNewCode: 0,
    platform: 'yqq'
  })
  return jsonp(url, data, options)
}

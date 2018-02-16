import storage from 'good-storage'

/**
 * 需求决定,最多保存15条记录,最新的记录出现在第一条
 * 如果有重复的数据,就把旧的删除,将新的插入到最前面
 */
const SEARCH_KEY = '__search__' // 存储的key
const SEARCH_MAX_LENGTH = 15 // 最多存储条数

/**
 * 将插入元素单独封装
 * @param arr arr 目标数组,这边就是搜索历史
 * @param val str||num 插入的值
 * @param compare fun 比较函数
 * @param maxLen num 数组长度最大值
 */
function insertArray(arr, val, compare, maxLen) {
  const index = arr.findIndex(compare)
  if (index === 0) return // 第一条就是我们要找的数据的情况
  if (index > 0) { // 如果不在第一条
    arr.splice(index, 1) // 先删掉就数据
  }
  arr.unshift(val)
  if (maxLen && arr.length > maxLen) { // 如果最终数据超过15条,删除最后一条
    arr.pop()
  }
}

function deleteFromArray(arr, compare) {
  const index = arr.findIndex(compare)
  if (index > -1) {
    arr.splice(index, 1)
  }
}

/**
 * storage.get(key, def)
 * 参数一: key
 * 参数二: 默认值(这边我们决定,如果找不到就给一个空数组)
 */
export function saveSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  insertArray(searches, query, item => { // 这个方法会改变 searches 这个数组
    return item === query
  }, SEARCH_MAX_LENGTH)
  storage.set(SEARCH_KEY, searches) // 保存在本地缓存
  return searches // 将数组抛出,给vuex
}

/**
 * 每次刷新vuex就会清空
 * 需要在载入页面的时候,将本地缓存的历史记录给添加给state
 */
export function loadSearch() {
  return storage.get(SEARCH_KEY, [])
}

export function deleteSearch(query) {
  let searches = storage.get(SEARCH_KEY, [])
  deleteFromArray(searches, item => {
    return item === query
  })
  storage.set(SEARCH_KEY, searches) // 保存在本地缓存
  return searches // 将数组抛出,给vuex
}

export function clearSearch() {
  storage.remove(SEARCH_KEY)
  return []
}

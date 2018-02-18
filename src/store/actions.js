/**
 * 当需要操作多个mutation的时候
 * 用action进行封装
 */
import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'
import {
  saveSearch,
  deleteSearch,
  clearSearch,
  savePlay,
  saveFavorite,
  deleteFaorite
} from 'common/js/cache'

function findIndex(list, song) {
  return list.findIndex(item => {
    return item.id === song.id
  })
}

export const selectPlay = function ({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list)
  if (state.mode === playMode.random) {
    let randomList = shuffle(list) // 打乱播放列表
    commit(types.SET_PLAYLIST, randomList) // 设置播放列表
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAYLIST, list)
  }
  commit(types.SET_CURRENT_INDEX, index)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

export const randomPlay = function ({commit}, {list}) {
  commit(types.SET_PLAY_MODE, playMode.random) // 设置随机播放
  commit(types.SET_SEQUENCE_LIST, list) // 取得播放列表
  let randomList = shuffle(list)  // 打乱播放列表
  commit(types.SET_PLAYLIST, randomList) // 设置播放列表
  commit(types.SET_CURRENT_INDEX, 0) // 从第一个开始播放
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

/**
 * 在搜索页面中,点击歌曲时,将歌曲插入到当前播放列表中
 */
export const insertSong = function ({commit, state}, song) {
  let playlist = state.playlist.slice() // 当前播放列表,调用slice返回一个新的数组,可以避免影响旧数组,否则vuex会报错
  let sequenceList = state.sequenceList.slice() // 顺序播放列表,调用slice返回一个新的数组,可以避免影响旧数组,否则vuex会报错
  let currentIndex = state.currentIndex // 当前歌曲下标索引,这个是一个简单类型的数据,修改了不会影响原来的值
  // 记录当前歌曲
  let currentSong = playlist[currentIndex] // 当前歌曲
  let fpIndex = findIndex(playlist, song) // 查找当前列表中,是否有待插入的歌曲
  currentIndex++ // 插入到下一行
  playlist.splice(currentIndex, 0, song) // 插入这首歌到当前索引位置
  if (fpIndex > -1) { // 如果已经包含了这首歌, 就删除
    if (currentIndex > fpIndex) { // 当前插入的索引 > 列表中的索引
      playlist.splice(fpIndex, 1)
      currentIndex--
    } else { // 当前插入的索引 <= 列表中的索引
      playlist.splice(fpIndex + 1, 1)
    }
  }
  // 下面是顺序播放列表的逻辑
  let currentSIndex = findIndex(sequenceList, currentSong) + 1
  let fsIndex = findIndex(sequenceList, song)
  sequenceList.splice(currentSIndex, 0, song)
  if (fsIndex > -1) {
    if (currentSIndex > fsIndex) {
      sequenceList.splice(fsIndex, 1)
    } else {
      sequenceList.splice(fsIndex + 1, 1)
    }
  }
  commit(types.SET_PLAYLIST, playlist) // 将副本数组提交给mutation,来修改state中的数据,就不会报错了
  commit(types.SET_SEQUENCE_LIST, sequenceList) // 将副本数组提交给mutation,来修改state中的数据,就不会报错了
  commit(types.SET_CURRENT_INDEX, currentIndex)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}

// 从播放列表中删出一条歌曲
export const deleteSong = function ({commit, state}, song) {
  let playlist = state.playlist.slice()
  let sequenceList = state.sequenceList.slice()
  let currentIndex = state.currentIndex
  let pIndex = findIndex(playlist, song)
  playlist.splice(pIndex, 1)
  let sIndex = findIndex(sequenceList, song)
  sequenceList.splice(sIndex, 1)
  if (currentIndex > pIndex || currentIndex === playlist.length) {
    currentIndex--
  }
  commit(types.SET_PLAYLIST, playlist)
  commit(types.SET_SEQUENCE_LIST, sequenceList)
  commit(types.SET_CURRENT_INDEX, currentIndex)
  // 如果播放列表没东西就是false
  const playingState = playlist.length > 0
  commit(types.SET_PLAYING_STATE, playingState)
} // deleteSong

export const deleteSongList = function ({commit}) {
  commit(types.SET_PLAYLIST, [])
  commit(types.SET_SEQUENCE_LIST, [])
  commit(types.SET_CURRENT_INDEX, -1)
  commit(types.SET_PLAYING_STATE, false)
}

/**
 * 保存搜索记录到缓存
 * 共享搜索记录
 */
export const saveSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, saveSearch(query))
}

export const deleteSearchHistory = function ({commit}, query) {
  commit(types.SET_SEARCH_HISTORY, deleteSearch(query))
}

// 清空所有搜索历史
export const clearSearchHistory = function ({commit}) {
  commit(types.SET_SEARCH_HISTORY, clearSearch())
}

/**
 * 保存播放历史
 */
export const savePlayHistory = function ({commit}, song) {
  commit(types.SET_PLAY_HISTORY, savePlay(song))
}

/**
 * 收藏列表相关
 */
export const saveFavoriteList = function ({commit}, song) { // 保存
  commit(types.SET_FAVORITE_LIST, saveFavorite(song))
}

export const deleteFavoriteList = function ({commit}, song) { // 删除
  commit(types.SET_FAVORITE_LIST, deleteFaorite(song))
}

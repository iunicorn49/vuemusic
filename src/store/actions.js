/**
 * 当需要操作多个mutation的时候
 * 用action进行封装
 */
import * as types from './mutation-types'
import {playMode} from 'common/js/config'
import {shuffle} from 'common/js/util'

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

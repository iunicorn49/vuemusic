import {playMode} from 'common/js/config'

const state = {
  singer: {},
  playing: false, // 播放器-是否播放
  fullScreen: false, // 播放器-是否全屏
  playlist: [], // 播放列表
  sequenceList: [], // 顺序播放列表,当播放模式为顺序播放时,次列表应当和playList相同
  mode: playMode.sequence, // 播放模式,默认顺序播放
  currentIndex: -1 // 当前播放的索引
}

export default state

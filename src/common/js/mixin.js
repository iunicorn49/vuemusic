// Mixin 就是 组件公用的代码
import {mapGetters} from 'vuex'

export const playlistMixin = {
  computed: {
    ...mapGetters([
      'playlist'
    ])
  },
  mounted() {
    this.handlePlaylist(this.playlist)
  },
  activated() { // vue keepalive组件的钩子函数
    this.handlePlaylist(this.playlist)
  },
  watch: {
    playlist(newVal) {
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    handlePlaylist() { // 如果组件里没有定义handlePlaylist方法,则调用mixin的handlePlaylist,就会抛出异常
      throw new Error('component must implement handlePlaylist methods')
    } // handlePlaylist
  } // methods
} // playlistMixin

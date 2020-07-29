const app = getApp()
let videoTimer = null // 使用定时器后，及时进行清除
let swiperAnimateEndTimer = null // 判断滑动的定时器
Page({
  /**
   * 页面的初始数据
   */
  data: {
    // video数据
    swiperVideoDataList: [], // swiper内循环的video
    videoBox: [], // 存放所有video的盒子
    videoBoxIndex: 0, // 总下标
    indexCurrent: 0, // 当前播放视频的下标
    circularBol: false, // swiper是否允许衔接滑动
    pageIndex: 0, // 当前页
  },

  // 生命周期函数--监听页面加载
  onLoad: function () {
    this.getVideoDataList()
  },

  /**核心事件集 */
  // 获取数据
  getVideoDataList() {
    const that = this
    that.getData()
      .then((res) => {
        console.log(res)
        let dataArr = res
        let newVideoBox = [...that.data.videoBox, ...dataArr]
        that.setSwiperData(
          that.data.swiperVideoDataList,
          newVideoBox,
          that.data.videoBoxIndex
        )
        that.setData({
          pageIndex: that.data.pageIndex + 1
        })
      })
      .catch((err) => {
        console.log(err)
      })
  },
  // 修改swiper内数据
  setSwiperData(swiperData, videoBox, videoBoxIndex, sort = true) {
    let that = this
    let datas = [...swiperData]

    if (that.data.pageIndex === 0) {
      datas = videoBox.slice(videoBoxIndex, 4)
    } else {
      // 根据 正、倒序 来分别进行处理
      if (sort) {
        //  计算要替换的下标
        let idx = swiperData.length - ((videoBoxIndex % 4) + 2)
        // 修正错误的下标(可能是逻辑错误，当前运用规律直接将错误修正)
        let saveIndex = Math.abs(idx === 1 ? 3 : idx)
        // 要替换的新数据
        let newDataList = videoBox[videoBoxIndex + 2]
        // 替换数据
        datas.splice(saveIndex, 1, newDataList)
        // console.log('下滑修改swiper数据')
        // console.log(newDataList, videoBoxIndex, saveIndex, 'swiperData:', datas, 'dataBox', videoBox)
      } else {
        //  计算要替换的下标
        let idx = (videoBoxIndex - (videoBoxIndex > 6 ? 4 : 0) - 2) % 4
        // 修正错误的下标(可能是逻辑错误，当前运用规律直接将错误修正)
        let saveIndex =
          videoBoxIndex > 1 ?
          Math.abs(idx) + 1 === 4 ?
          0 :
          Math.abs(idx) + 1 :
          Math.abs(idx)
        // 要替换的新数据
        let i = (videoBoxIndex === 1 ? 2 : videoBoxIndex + 1) - 2
        let newDataList = videoBox[i] || null
        // 替换数据
        if (videoBoxIndex > 0)
          datas.splice(videoBoxIndex === 1 ? 0 : saveIndex, 1, newDataList)
        // console.log(newDataList, videoBoxIndex, saveIndex, 'swiperData:', datas, 'dataBox', videoBox)
      }
    }
    // console.log(videoBoxIndex, videoBox.length)
    this.setData({
      swiperVideoDataList: datas,
      videoBox,
      circularBol: videoBoxIndex > 1 &&
        videoBoxIndex + 4 <= videoBox.length
    })
  },
  // 滑动触发
  swiperChange(e) {
    console.log('swiper change')
    let that = this
    // 正序 - true  倒序 - false
    let bol =
      (that.data.indexCurrent + 1 === 4 ? 0 : that.data.indexCurrent + 1) ===
      e.detail.current
    let newBoxIndex = bol ?
      that.data.videoBoxIndex + 1 :
      that.data.videoBoxIndex - 1
    // 判断条件1 -- 到达预定获取数据点且是下滑   条件2 -- 当前视频总下标 + 4 大于 总数据长度，网络较差||无网络
    if (
      (this.data.videoBoxIndex + 5 === this.data.videoBox.length && bol) ||
      this.data.videoBoxIndex + 4 >= this.data.videoBox.length
    ) {
      // console.log('请求数据下滑处理', this.data.indexCurrent)
      videoTimer = setTimeout(() => {
        that.getVideoDataList()
        clearTimeout(videoTimer)
      }, 400)
      // 条件一，向下滑动次数>=2， >=2时开始轮循   条件二，且向下滑动次数 >= 1 保证当boxIndex===1的时候将 indexCurrent === 0 的swiepr数据替换 (正常情况下都是替换 indexCurrent - 2 的数据 但是当boxIndex === 1 && indexCurrent === 1 的时候，只能替换首条)
    } else if (newBoxIndex >= 2 || (!bol && newBoxIndex >= 1)) {
      // console.log('普通滑动处理')
      this.setSwiperData(
        this.data.swiperVideoDataList,
        this.data.videoBox,
        newBoxIndex,
        bol
      )
    }
    // 切换当前video下标
    this.setData({
      indexCurrent: e.detail.current,
      videoBoxIndex: newBoxIndex,
    })
  },
  getData() {
    return new Promise(r => {
      let newArr = []
      joinNewNum(this.data.videoBox.length, 0)

      function joinNewNum(num, max) {
        newArr.push(num)
        if (max < 5) joinNewNum(num + 1, max + 1)
      }
      r(newArr)
    })
  },
})
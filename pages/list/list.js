const weekMap = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']

Page({
  data:{
    weekWeather: [],
    city: "深圳市"
  },

  getWeekWeather(callback) {
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/future',
      data: {
        city: this.data.city,
        time: new Date().getTime()
      },
      success: res => {
        let result = res.data.result
        console.log(res.data)
        this.setWeekWeather(result)
      },
      complete: () => {
        callback && callback()
      }
    })
  },

  setWeekWeather(result){
    let weather = []
    for (let i = 0; i < 7; i++) {
      let date = new Date()
      date.setDate(date.getDate() + i)
      let y = date.getFullYear()
      let m = date.getMonth() + 1
      let d = date.getDate()

      weather.push({
        day: weekMap[date.getDay()],
        date: y + '-' + m + '-' + d,
        temp: result[i].minTemp + '°' + ' — ' + result[i].maxTemp + '°',
        iconPath: '/images/' + result[i].weather + '-icon.png'
      })
      weather[0].day = '今天'
      this.setData({
        weekWeather:weather
      })
    }
  },

  onLoad(options){
    this.setData({
      city: options.city
    })
    this.getWeekWeather()
  },

  onPullDownRefresh() {
    this.getWeekWeather(() => {
      console.log("stop pull down")
      wx.stopPullDownRefresh()
    })
  }
})

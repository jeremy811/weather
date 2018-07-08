const weatherMap = {
  'sunny':'晴天',
  'cloudy':'多云',
  'overcast':'阴',
  'lightrain':'小雨',
  'heavyrain': '大雨',
  'snow': '雪',
}
const weatherColorMap = {
  'sunny': '#cbeeff',
  'cloudy': '#deeef6',
  'overcast': '#c6ced2',
  'lightrain': '#bdd5e1',
  'heavyrain': '#c5ccd0',
  'snow': '#aae1fc'
}

Page({
  data:{
    hourlyWeather: [],
    nowTemp:"",
    nowWeather:"",
    nowWeatherBg:"",
    todayDate:"",
    todayTemp:""
  },
  onPullDownRefresh(){
    this.getNow(()=>{
      console.log("stop pull down")
      wx.stopPullDownRefresh()
    })
  },
  onLoad(){
      this.getNow()
  },
  getNow(callback){
    wx.request({
      url: 'https://test-miniprogram.com/api/weather/now',
      data:{
        city:"深圳"
      },
      success:res => {
        let result = res.data.result
        console.log(res.data)
        this.setNow(result)
        this.setHourlyWeather(result)
        this.setToday(result)
      },
      complete:()=>{
        callback && callback()
      }
    })
  },
  setNow(result){
    let temp = result.now.temp
    let weather = result.now.weather
    this.setData({
      nowTemp: temp + '°',
      nowWeather: weatherMap[weather],
      nowWeatherBg: '/images/' + weather + '-bg.png'
    })
    wx.setNavigationBarColor({
      frontColor: '#000000',
      backgroundColor: weatherColorMap[weather]
    })
  },
  setHourlyWeather(result){
    let hourlyWeather = []
    let nowHour = new Date().getHours()
    let forecast = result.forecast
    for (let i = 0; i < 8; i += 1) {
      hourlyWeather.push({
        time: (i * 3 + nowHour) % 24 + '时',
        iconPath: '/images/' + forecast[i].weather + '-icon.png',
        temp: forecast[i].temp + '°'
      })
    }
    hourlyWeather[0].time = '现在'
    this.setData({
      hourlyWeather: hourlyWeather
    })
  },

  setToday(result){
    let today = result.today
    let date = new Date()
    let y = date.getFullYear()
    let m = date.getMonth() + 1
    let d = date.getDate()    
    this.setData({
      todayTemp: today.minTemp + '°' + ' — ' + today.maxTemp + '°',
      todayDate: y + '-' + m + '-' + d + ' 今天'
    })
  }
})

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

const QQMapWX = require('../../libs/qqmap-wx-jssdk.js')

const UNPROMPTED = 0
const UNAUTHORIZED = 1
const AUTHORIZED = 2

const UNPROMPTED_TIPS = "点击获取当前位置"
const UNAUTHORIZED_TIPS = "点击开启位置权限"
const AUTHORIZED_TIPS = ""

Page({
  data:{
    hourlyWeather: [],
    nowTemp:"",
    nowWeather:"",
    nowWeatherBg:"",
    todayDate:"",
    todayTemp:"",
    city:"深圳",
    locationTipsText:"点击获取当前位置",
    locationAuthType:UNPROMPTED
  },
  onPullDownRefresh(){
    this.getNow(()=>{
      console.log("stop pull down")
      wx.stopPullDownRefresh()
    })
  },

  onLoad(){
      this.qqmapsdk = new QQMapWX({
        key: 'EAXBZ-33R3X-AA64F-7FIPQ-BY27J-5UF5B'
      });
      this.getNow()
  },

  onShow() {
    wx.getSetting({
      success: res => {
        let auth = res.authSetting['scope.userLocation']
        if (auth && this.data.locationAuthType != AUTHORIZED) {
          this.setData({
            locationAuthType: AUTHORIZED,
            locationTipsText: AUTHORIZED_TIPS
          })
        }
        else if(UNPROMPTED != this.data.locationAuthType && !auth){
          this.setData({
            locationAuthType: UNAUTHORIZED,
            locationTipsText: UNAUTHORIZED_TIPS
          })
        }
      }
    })
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
  },

  onTapTodayWeather(){
    wx.navigateTo({
      url: '/pages/list/list?city=' + this.data.city,
    })
  },

  onTapLocation() {
    if(UNAUTHORIZED == this.data.locationAuthType){
      wx.openSetting()
    }
    else {
      this.getCurLocation()
    }
  },

  getCurLocation(){
    wx.getLocation({
      success: res => {
        console.log(res.latitude, res.longitude)
        this.setData({
          locationAuthType: AUTHORIZED,
          locationTipsText: AUTHORIZED_TIPS
        })
        this.qqmapsdk.reverseGeocoder({
          location: {
            latitude: res.latitude,
            longitude: res.longitude
          },
          success: res => {
            let city = res.result.address_component.city
            console.log(city)
            this.setData({
              city: city,
              locationTipsText: ""
            })
            this.getNow()
          }
        })
      },
      fail: () => {
        this.setData({
          locationAuthType: UNAUTHORIZED,
          locationTipsText: UNAUTHORIZED_TIPS
        })
      }
    })
  }
})

Page({

  data: {
    isLoading:true,
    goods_info:{},
    animationData:{},
    goodsId:""
  },

  onLoad: function (options) {
    let _this = this,
        goodsId = Number(options.goodsId);

    _this.setData({
      goodsId:options.goodsId
    });

    _this.loadingHandler(_this.data.isLoading);

    wx.cloud.callFunction({
      name:"getGoodsDetail",
      data:{
        goodsId:goodsId
      }
    }).then(res => {
      res.result.data[0].goodsGalleryUrls.shift();
      // res.result.data[0].recommend = "这是商品推荐";
      _this.setData({
        goods_info:res.result.data[0],
        isLoading:false
      });

      _this.loadingHandler(_this.data.isLoading);
      // console.log(_this.data.goods_info);
    });
  },

  onShareAppMessage:function(){
    return{
      title:"惠惠好券",
      path:"/miniprogram/pages/detail/detail?goodsId="+this.data.goodsId
    };
  },

  // loading控制器
  loadingHandler: function (show_loading) {
    if(show_loading) {
      wx.showLoading({
        title:"加载中..."
      });
    }else {
      wx.hideLoading();
    }
  },

  getCoupon:function () {
    console.log(this.data.goods_info.webAppInfo.appId);
    wx.navigateToMiniProgram({
      appId: this.data.goods_info.webAppInfo.appId,
      path:this.data.goods_info.webAppInfo.pagePath
    })
  },

  findMoreCoupon:function () {
    wx.switchTab({
      url: '../index/index',
    })
  },

  hideBottomBar:function(){
    let hideBottomBar = wx.createAnimation({
      duration:500
    });
    hideBottomBar.bottom(-120).opacity(0).step();
    this.setData({
      animationData:hideBottomBar.export()
    });
  },

  showBottomBar:function(){
    let showBottomBar = wx.createAnimation({
      duration:500
    });
    showBottomBar.bottom(0).opacity(100).step();
    this.setData({
      animationData:showBottomBar.export()
    });
  },

  navigateTo:function(e){
    wx.switchTab({
      url: '../index/index',
    })
  },
})
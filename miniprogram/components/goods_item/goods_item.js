Component({

  properties: {
    goodsInfo:{
      type:Object,
      value:{}
    }
  },

  data: {
    touchstarttime:0
  },

  methods: {

    chooseGoods: function (e) {

      let url = "../../pages/detail/detail"+"?"+"goodsId="+String(e.currentTarget.dataset.goodsid);

      wx.navigateTo({
        url: url
      });
      
    },

    touchstart:function(e){
      this.setData({
        touchstarttime:e.timeStamp
      });
    },

    touchend:function(e){
      let goodsId = e.currentTarget.dataset.goodsid;
      if((e.timeStamp - this.data.touchstarttime) >2000){
        wx.setClipboardData({
          data: String(goodsId)
        });
      }
    },

    goToPDD:async function(){
      let _this = this,
          res;

      wx.showLoading({
        title: '即将跳转...',
      });

      res = await wx.cloud.callFunction({
        name:"getGoodsDetail",
        data:{
          goodsId:_this.properties.goodsInfo.goodsId
        }
      });
      
      let {appId,pagePath} = res.result.data[0].webAppInfo;

      wx.hideLoading({});

      wx.navigateToMiniProgram({
        appId:appId,
        path:pagePath
      });
    }

  }
})

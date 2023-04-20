Page({

  data: {
    goods_list:[],
    page:1,
    isDone:true,
    isloading:true
  },

  onLoad: function (options) {

    let _this = this;

    _this.loadingHandler(_this.data.isloading);

    wx.cloud.callFunction({
      name:"getGoodsListByType",
      data:{
        channelType:0,
        skip:(_this.data.page - 1) * 10
      }
    }).then(res => {
      _this.setData({
        goods_list:res.result.data,
        page:_this.data.page + 1,
        isloading:false
      });

      if(res.result.data.length < 10){
        _this.setData({
          isDone:false
        });
      }
      
      _this.loadingHandler(_this.data.isloading);
    });

  },

  onReachBottom: function () {
    let _this = this,
        goods_list = _this.data.goods_list;
    if(this.data.isDone){
 
      wx.cloud.callFunction({
        name:"getGoodsListByType",
        data:{
          channelType:0,
          skip:(_this.data.page - 1) * 10
        }
      }).then(res => {
        for(let i = 0,max = res.result.data.length;i < max;i++){
          goods_list.push(res.result.data[i]);
        };
        _this.setData({
          goods_list:goods_list,
          page:_this.data.page + 1
        });

        if(res.result.data.length < 10 || _this.data.page > 10){
          _this.setData({
            isDone:false
          });
        }

        console.log(_this.data.goods_list)
      });
    }
  },

  loadingHandler: function (show_loading) {
    if(show_loading) {
      wx.showLoading({
        title:"加载中..."
      });
    }else {
      wx.hideLoading();
    }
  },

  onShareAppMessage:function(){
    return{
      title:"惠惠好券",
      path:"/miniprogram/pages/parcel/parcel"
    };
  },
})
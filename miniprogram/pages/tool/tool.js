import {cloud_env} from "../../config.js";

const db = wx.cloud.database({
  env:cloud_env.env
});

Page({

  data: {
    appId:Number,
    path:String,
    input_value:'',
    _id:0,
    goodsImageUrl:'',
    goodsName:'',
    commendDesc:'',
    goodsInfo:{}
  },

  
  onLoad: function (options) {

    let _this = this;

    db.collection("GoodsList").count().then(res => {
      console.log(res);
    });
    
    db.collection('PddAuthUrlInfo').limit(1).get().then((res)=> {

      console.log(res);

      _this.setData({
        appId:res.data[0].appId,
        path:res.data[0].pagePath
      });
    });
  },

  goToPdd:function(){
    wx.navigateToMiniProgram({
      appId:this.data.appId,
      path:this.data.path
    });
  },

  push:function(){
    wx.showModal({
      title:"警告",
      content:"是否执行线上推送？",
      confirmText:"执行",
      cancelText:"取消",
      success:function(res){
        if(res.confirm){
          wx.cloud.callFunction({
            name:"push"
          }).then(res => {
            console.log(res);
          });
        }
      }
    });
  },

  getInputValue:function(e){
    this.setData({
      input_value:e.detail.value
    });
  },

  findGoods:function(){
    let _this = this;
    if(this.data.input_value){
      wx.cloud.callFunction({
        name:"getGoodsDetail",
        data:{
          goodsId:Number(_this.data.input_value)
        }
      }).then(res => {
        console.log(res);
        _this.setData({
          _id:res.result.data[0]._id,
          goodsImageUrl:res.result.data[0].goodsImageUrl,
          goodsName:res.result.data[0].goodsName,
          commendDesc:res.result.data[0].commendDesc,
          goodsInfo:res.result.data[0]
        });
        console.log(_this.data);
      });
    }
  },

  addToDatabase:function(){
    let goodsInfo = this.data.goodsInfo;
    goodsInfo.goodsName = this.data.goodsName;
    goodsInfo.commendDesc = this.data.commendDesc;

    wx.cloud.callFunction({
      name:"addGoodsToDaily",
      data:{
        goods:goodsInfo
      }
    }).then(res => {
      if(res.result._id){
        wx.showToast({
          title: '入库成功',
        });
      }else{
        wx.showToast({
          title: '入库失败',
        });
      }
    });
  },

  cancel:function(){
    this.setData({
      input_value:'',
      _id:0,
      goodsImageUrl:'',
      goodsName:'',
      commendDesc:'',
      goodsInfo:{}
    });
  },

  bannerSwitch:async function(){
    let res = await db.collection("DailyBanner").get();
    if(res.data[0].isShow){
      db.collection("DailyBanner").doc(res.data[0]._id).update({
        data:{
          isShow:false
        },
        success:function(res){
          wx.showToast({
            title: '切换成功',
          });
        }
      });
    }else{
      db.collection("DailyBanner").doc(res.data[0]._id).update({
        data:{
          isShow:true
        },
        success:function(res){
          wx.showToast({
            title: '切换成功',
          });
        }
      });
    }
  }
});
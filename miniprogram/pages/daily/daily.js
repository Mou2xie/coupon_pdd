Page({

  data: {
    goods_list:[],
    current:0,
    commendDesc:'',
    num_arr:[]
  },

  onLoad: function (options) {
    let _this = this;

    wx.showLoading({
      title: '加载中...',
    });

    wx.cloud.callFunction({
      name:"getDailyList",
    }).then(res => {
      let num_arr = [];
      res.result.data.splice(3,0,{});
      if(res.result.data.length > 7){
        res.result.data.push({});
      }
      
      for(let i = 0,max = res.result.data.length;i<max;i++){
        num_arr.push(i+1);
      };
      _this.setData({
        goods_list:res.result.data,
        commendDesc:res.result.data[0].commendDesc,
        num_arr:num_arr
      });

      wx.hideLoading({
        complete:function(){
          setTimeout(()=>{
            wx.showToast({
              icon:"none",
              title: '<—滑动看更多—>',
            });
          },500);  
        }
      });    
    });
  },

  subscribe: function(){
    let _this = this;

    //发起订阅请求
    wx.requestSubscribeMessage({
      tmplIds: ["dikAlca_INAFPduS9hKUO4sN54VBrqieDaE8ileXxn8"],
      success:function(res){
        //返回操作结果
        if(res.dikAlca_INAFPduS9hKUO4sN54VBrqieDaE8ileXxn8 == "accept"){
          //当结果为“允许”时执行订阅消息方法
          _this.addUserToDatabase();
        }else if(res.dikAlca_INAFPduS9hKUO4sN54VBrqieDaE8ileXxn8 == "reject"){
          //当操作结果为“拒绝”时，有两种可能：一是用户一次性拒绝；二是持续性拒绝，要查看用户设置来分别处理
          wx.getSetting({
            withSubscriptions: true,
            success:function(res){
              if(res.subscriptionsSetting.itemSettings){
                //返回的subscriptionsSetting对象中如果存在itemSettings，说明用户对某些模版进行过持续性设置
                if(res.subscriptionsSetting.itemSettings.dikAlca_INAFPduS9hKUO4sN54VBrqieDaE8ileXxn8){
                  //再看看itemSettings中有没有我们刚才请求的模板ID，如果有，说明用户对这个模板设置了持续性的reject，执行弹窗提醒
                  _this.openAuthorizeModal();
                }else{
                  //如果itemSettings中没有请求的模板ID，说明用户是一次性拒绝，反馈订阅失败
                  wx.showToast({
                    title: '订阅失败',
                    icon:"error"
                  });
                }    
              }else{
                //返回的subscriptionsSetting对象中不存在itemSettings，说明用户是一次性拒绝，反馈订阅失败
                wx.showToast({
                  title: '订阅失败',
                  icon:"error"
                });
              }
            }
          })
        }else{
          //当返回的操作结果为其他状态时统一提示订阅失败
          wx.showToast({
            title: '订阅失败',
            icon:"error"
          });
        }
      },
      fail:function(res){
        //如果用户关闭了消息主开关，将会通过fail返回，错误码20004
        if(res.errCode == 20004){
          //用户关闭了主开关，执行弹窗提醒
          _this.openAuthorizeModal();
        }
      }
    });
  },

  //订阅消息方法
  addUserToDatabase:function (){
    wx.showLoading({
      title: '订阅中...',
    });
    wx.cloud.callFunction({
      name:"userOperater",
      data:{
        operate:"add"
      }
    }).then(res => {
      if(res.result._id || res.result.stats.updated == 1){
        wx.hideLoading({
          success: (res) => {
            wx.showToast({
              title: '订阅成功',
              icon:"success"
            });
          },
        });
      }
    });
  },

  //打开提示弹窗
  openAuthorizeModal:function(){
    let _this = this;
    //打开弹窗
    wx.showModal({
      content:"您尚未开启消息订阅功能，是否去设置？",
      cancelText:"算了",
      confirmText:"设置",
      confirmColor:"#F64D46",
      cancelColor:"#9F9F9F",
      success:function(res){
        //用户点击“设置”，弹出设置面板
        if(res.confirm){
          wx.openSetting({
            withSubscriptions: true,
            success:function(res){
              //返回用户的设置结果
              if(res.subscriptionsSetting.mainSwitch){
                //如果消息主开关开启
                if(res.subscriptionsSetting.itemSettings){
                  //看看subscriptionsSetting中是否存在itemSettings，如果存在，说明用户对某些模版进行过持续性设置
                  if(res.subscriptionsSetting.itemSettings.dikAlca_INAFPduS9hKUO4sN54VBrqieDaE8ileXxn8){
                    //看看itemSettings中是否有我们申请的模板，如果有，说明这个模板被用户进行过某种持续性设置
                    if(res.subscriptionsSetting.itemSettings.dikAlca_INAFPduS9hKUO4sN54VBrqieDaE8ileXxn8 == 'accept'){
                      //如果我们申请的模板的值是“accept”，说明用户持续性允许了接收该模版消息，提示用户去订阅
                      wx.showToast({
                        title: '请再次点击订阅按钮',
                        icon:"none"
                      })
                    }else{
                      //如果我们申请的模板的值不是“accept”，说明用户对模板设置了持续性不接收消息。表示理解，友好提示
                      wx.showToast({
                        title: '消息订阅未开启',
                        icon:"error"
                      });
                    }
                  }else{
                    //如果itemSettings中没有我们申请的模板，表示用户没有对我们申请的模板进行过任何持续性的设置，可以让用户去订阅
                    wx.showToast({
                      title: '请再次点击订阅按钮',
                      icon:"none"
                    })
                  }
                }else{
                  //如果subscriptionsSetting中不存在itemSettings，说明用户没有对任何模板进行过持续性设置，可以让用户去订阅
                  wx.showToast({
                    title: '请再次点击订阅按钮',
                    icon:"none"
                  })
                }
              }else{
                //如果消息主开关关闭，说明用户铁了心不想接收任何消息，保持风度，尊重用户的选择
                wx.showToast({
                  title: '消息订阅未开启',
                  icon:"error"
                });
              }
            }
          });
        }
      }
    })
  },

  touchStart:function(e){
    this.statrTime = e.timeStamp;
  },

  touchEnd:function(e){
    if((e.timeStamp - this.statrTime)>2000){
      wx.navigateTo({
        url: '../tool/tool',
      });
    }
  },

  swiperChange:function(e){
    let _this = this,
        current = e.detail.current;
    
    this.setData({
      current:current,
      commendDesc:_this.data.goods_list[current].commendDesc,
    });
  },

  goToPDD:function(){
    let {appId,pagePath} = this.data.goods_list[this.data.current].webAppInfo

    wx.navigateToMiniProgram({
      appId: appId,
      path:pagePath
    })
  },

  onShareAppMessage:function(){
    return{
      title:"惠惠好券",
      path:"/miniprogram/pages/daily/daily"
    };
  },
})
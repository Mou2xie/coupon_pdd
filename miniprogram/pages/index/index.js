Page({

  private_data:{

    isloading:true,
    goods_list:[]

  },

  data: {

    sort:[],
    goods_list_show: [],
    isListEnd:false,
    sort_chosen:"",
    banner_show:false

  },

  onLoad: function (options) {

    let _this = this;

    // loading
    _this.loadingHandler(_this.private_data.isloading);

    wx.cloud.callFunction({
      name:"bannerIsOn"
    }).then(res => {
      _this.setData({
        banner_show:res.result.data[0].isShow
      });
    });

    // 获取首页分类
    wx.cloud.callFunction({
      name:"getSort",
      data: {
        res_num:10
      }
    }).then(res => {

      let sort = res.result.data,
          goods_list = [];

      for(let i = 0,max = res.result.data.length;i < max;i++) {
        let item = {};
        sort[i].isChoosen = false;
        item.catId = sort[i].catId;
        item.catName = sort[i].catName;
        item.page = 1;
        item.goods = [];
        item.isDone = true;
        goods_list.push(item);     
      };

      sort[0].isChoosen = true;

      _this.setData({
        sort:sort
      });

      _this.private_data.goods_list = goods_list;

      wx.cloud.callFunction({
        name:"getGoodsList",
        data:{
          catId:_this.private_data.goods_list[0].catId,
          skip:(_this.private_data.goods_list[0].page - 1)*10
        }
      }).then(res => {
        console.log(res.result.data);
        _this.private_data.goods_list[0].goods = res.result.data;
        _this.private_data.goods_list[0].page = _this.private_data.goods_list[0].page + 1;

        _this.setData({
          goods_list_show:_this.private_data.goods_list[0].goods
        });
      });
      
      _this.private_data.isloading = false;
      
      // 关闭loading
      _this.loadingHandler(_this.private_data.isloading);

    });
    
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

  // 分类点击事件
  chooseSort: function (e) {
    let sort = this.data.sort,
        _this = this,
        sortId;

    for(let i = 0,max = sort.length;i < max;i++) {
      sort[i].isChoosen = false;
      if(sort[i].catId == e.target.dataset.catid) {
        sort[i].isChoosen = true;
        sortId = sort[i].sortId
      }
    };

    this.setData({
      sort:sort,
      sort_chosen:sortId
    });

    for(let i = 0,max = this.private_data.goods_list.length; i < max;i++) {

      if(e.target.dataset.catid == this.private_data.goods_list[i].catId) {

        if(this.private_data.goods_list[i].goods.length == 0){
          this.private_data.isloading = true;
          this.loadingHandler(this.private_data.isloading);

          this.setData({
            isListEnd:!this.private_data.goods_list[i].isDone
          });
          
          wx.cloud.callFunction({
            name:"getGoodsList",
            data:{
              catId:this.private_data.goods_list[i].catId,
              skip:(_this.private_data.goods_list[i].page - 1)*10
            }
          }).then(res => {
            console.log(res.result.data);
            _this.private_data.goods_list[i].goods = res.result.data;
            _this.private_data.goods_list[i].page = _this.private_data.goods_list[i].page + 1;
            
            if(res.result.data.length < 10){
              _this.private_data.goods_list[i].isDone = false;

              _this.setData({
                isListEnd:!_this.private_data.goods_list[i].isDone
              });
            };

            _this.setData({
              goods_list_show:_this.private_data.goods_list[i].goods
            });
            
            _this.private_data.isloading = false;
            _this.loadingHandler(_this.private_data.isloading);
          });
         }else{
          this.setData({
            goods_list_show:_this.private_data.goods_list[i].goods,
            isListEnd:!_this.private_data.goods_list[i].isDone
          });
        }
      }
    };
  },

  onReachBottom:function(){
    let current_sort_catId,
        sort_index,
        _this = this;

    for(let i = 0,max = this.data.sort.length;i < max;i++){
      if(this.data.sort[i].isChoosen){
        current_sort_catId = this.data.sort[i].catId;
      };
    };

    for(let i = 0,max = this.private_data.goods_list.length;i < max;i++){
      if(current_sort_catId == this.private_data.goods_list[i].catId){
        sort_index = i;

        if(this.private_data.goods_list[i].isDone){
          
          wx.cloud.callFunction({
            name:"getGoodsList",
            data:{
              catId:_this.private_data.goods_list[i].catId,
              skip:(_this.private_data.goods_list[i].page - 1)*10
            }
          }).then(res => {
            _this.private_data.goods_list[sort_index].page = _this.private_data.goods_list[sort_index].page + 1;
            
            for(let i = 0,max = res.result.data.length;i < max;i++){
              _this.private_data.goods_list[sort_index].goods.push(res.result.data[i]);
            };

            _this.setData({
              goods_list_show:_this.private_data.goods_list[sort_index].goods
            });

            if(res.result.data.length < 10 || _this.private_data.goods_list[sort_index].page > 10){
              _this.private_data.goods_list[sort_index].isDone = false;

              _this.setData({
                isListEnd:!_this.private_data.goods_list[sort_index].isDone
              });
            };
          });
        }else{
          return
        };
      }
    }
  },

  goToDaily:function(){
    wx.switchTab({
      url: '../daily/daily',
    })
  },

  onShareAppMessage:function(){
    return{
      title:"惠惠好券",
      path:"/pages/index/index"
    };
  },

})
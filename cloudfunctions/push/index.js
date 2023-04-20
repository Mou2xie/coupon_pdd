// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;
const LIMIT_NUM = 100;

// 云函数入口函数
exports.main = async (event, context) => {
  let user_res,
      user_arr = [],
      promise_arr = [],
      user_num = (await db.collection("subscribeUser").count()).total,
      times = Math.ceil(user_num / LIMIT_NUM);

  for(let i = 0;i < times;i++){
    let promise = db.collection("subscribeUser").skip(i * LIMIT_NUM).limit(LIMIT_NUM).get();
    promise_arr.push(promise);
  };

  user_res = await Promise.all(promise_arr);

  for(let i =0,max = user_res.length;i < max;i++){
    for(let a = 0,max = user_res[i].data.length;a < max;a++){
      user_arr.push(user_res[i].data[a]);
    };
  };

  for(let b = 0,max = user_arr.length;b < max;b++){
    let res;
    try{
      res = await cloud.openapi.subscribeMessage.send({
        touser:user_arr[b].OPENID,
        templateId:"dikAlca_INAFPduS9hKUO4sN54VBrqieDaE8ileXxn8",
        page:"pages/daily/daily",
        data:{
          "thing1":{
            "value":"这是今天的好券日报，请查收"
          },
          "thing2":{
            "value":"点击本卡片进入小程序"
          }
        },
        miniprogramState:"trial"
      }); 

      if(res.errCode == 0){
        db.collection("subscribeUser").where({OPENID:user_arr[b].OPENID}).get().then(res => {
          if(res.data[0].subscribe_times > 1){
            db.collection("subscribeUser").doc(res.data[0]._id).update({
              data:{
                subscribe_times: _.inc(-1)
              }
            });
          }else{
            db.collection("subscribeUser").doc(res.data[0]._id).remove();
          };
        });
      }
    }catch(err){
      db.collection("subscribeUser").where({OPENID:user_arr[b].OPENID}).get().then(res => {
        db.collection("subscribeUser").doc(res.data[0]._id).remove();
      });
    }
  }
}
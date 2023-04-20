// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();
const _ = db.command;

// 云函数入口函数
exports.main = async (event, context) => {
  let {operate} = event,
      {OPENID} = cloud.getWXContext(),
      isUserExist,
      res;
  if(operate == "add"){
    isUserExist = await db.collection("subscribeUser").where({OPENID}).get();

    if(isUserExist.data.length == 0){
      res = await db.collection("subscribeUser").add({
        data:{
          OPENID,
          subscribe_times:1
        }
      });
    }else{
      res = await db.collection("subscribeUser").doc(isUserExist.data[0]._id).update({
        data:{
          subscribe_times: _.inc(1)
        }
      });
    };

    return res;
  }
}
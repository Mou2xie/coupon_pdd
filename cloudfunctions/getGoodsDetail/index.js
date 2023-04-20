// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  let res,
      {goodsId} = event;
  
  res = await db.collection("GoodsDetail")
        .where({
          goodsId:goodsId
        })
        .get();

  return res;
}
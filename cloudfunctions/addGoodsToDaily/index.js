// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
});

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {
  let {goods} = event,
      res1,
      res2;
  res1 = await db.collection("GoodsDaily").count();
  goods.sort = res1.total+1;
  res2 = await db.collection("GoodsDaily").add({
    data:goods
  });

  return res2;
}
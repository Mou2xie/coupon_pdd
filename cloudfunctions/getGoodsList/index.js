// 云函数入口文件
const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV
})

const db = cloud.database();

// 云函数入口函数
exports.main = async (event, context) => {

   let res,
       {catId,skip} = event;
       
   res = await db.collection("GoodsList")
   .where({
     catId:String(catId),
     channelType:7
   })
   .orderBy("sort","desc")
   .skip(skip)
   .limit(10)
   .get();

   console.log(res);

   return res;
}
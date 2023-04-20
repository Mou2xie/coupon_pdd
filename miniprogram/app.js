import {cloud_env} from "./config";

App({
  onLaunch:function() {
    wx.cloud.init({
      env:cloud_env.env
    });
  }
})

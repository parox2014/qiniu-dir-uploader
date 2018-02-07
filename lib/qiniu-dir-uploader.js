var qiniu = require('qiniu');
var fs = require('fs');
var path = require('path');
var log4js = require('log4js');
var MIMETypeMapper=require('./mime-map');


/**
 * 上传构造函数
 * @param {qdu.UploadOption} conf 
 */
function QiniuDirUploader(conf) {
  this.config = conf;

  var qnconfig = new qiniu.conf.Config();
  //指定空间对应的机房
  qnconfig.zone = conf.zone||qiniu.zone.Zone_z0;
  //上传是否是用CDN加速
  qnconfig.useCdnDomain = true;

  var putPolicy = new qiniu.rs.PutPolicy({
    scope: conf.bucket,
    expires: 1000 * 60 * 60 * 24,
    returnBody: '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)"}'
  });
  var mac = new qiniu.auth.digest.Mac(conf.accessKey, conf.secretKey);

  this.uploadToken = putPolicy.uploadToken(mac);
  this.formUploader = new qiniu.form_up.FormUploader(qnconfig);
  this.logger = log4js.getLogger(conf.loggerCategory||'Qiniu upload');
  this.logger.level = 'all';
}

/**
 * 上传一个文件
 * @param {string} key 文件名
 * @param {string} localFile 本地文件路径
 */
QiniuDirUploader.prototype.uploadFile = function (key, localFile) {
  var extname=path.extname(localFile);
  var mime=MIMETypeMapper[extname];
  var putExtra = new qiniu.form_up.PutExtra(null,null,mime);
  var logger=this.logger;

  this.formUploader.putFile(this.uploadToken, key, localFile, putExtra, function (respErr,
    respBody, respInfo) {
    if (respErr) {
      logger.error('File: "' + localFile + '" upload failed');
      throw respErr;
    }
    if (respInfo.statusCode == 200) {
      logger.info('File: "' + localFile + '" upload success');
      logger.debug('Remote File: "'+key+'"')
    } else {
      logger.error(respInfo.statusCode);
      logger.error(respBody);
    }
  });
}

QiniuDirUploader.prototype.readDir=function(dir,callback){

  var self = this;
  var conf = this.config;

  fs.readdir(dir, function (err, files) {
    if (err) throw err;
    files.forEach(function (file) {
      var filePath = dir + '\\' + file;

      fs.stat(filePath, function (err, stat) {

        if (err) throw err;

        if (stat.isDirectory()) {
          return self.readDir(filePath,callback);
        }

        var extname = path.extname(filePath);

        if (conf.excludes.indexOf(extname) > -1) {
          return;
        };
       callback&&callback.call(self,filePath);
      });
    })
  });
}

/**
 * 读取并上传一个目录里面的所有文件
 */
QiniuDirUploader.prototype.upload = function () {
  var self = this;
  var conf = this.config;

  this.readDir(conf.buildAssetsRoot,function(filePath){
    var key = filePath.replace(conf.buildAssetsRoot, conf.publishAssetsRoot);
    key = key.replace(/\\/g, '/');

    self.uploadFile(key, filePath);
  })
}

module.exports = {
  QiniuDirUploader:QiniuDirUploader,
  getUploader:function(conf){
    return new QiniuDirUploader(conf);
  }
};
var qiniu = require('qiniu');
var fs = require('fs');
var path = require('path');
var log4js = require('log4js');
var MIMETypeMapper = require('./mime-map');
var PrefechType = {
  AfterUpload: 1,
  AfterRefresh: 2
};
var DOMAIN_REG = /(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i;

/** @type {import('log4js').Logger} */
var logger=null;


/**
 * 上传构造函数
 * @param {import('../types/upload-options').UploadOption} conf
 */
function QiniuDirUploader(conf) {
  this.config = conf;

  var qnconfig = new qiniu.conf.Config();
  //指定空间对应的机房
  qnconfig.zone = conf.zone || qiniu.zone.Zone_z0;
  //上传是否是用CDN加速
  qnconfig.useCdnDomain = true;

  var putPolicy = new qiniu.rs.PutPolicy({
    scope: conf.bucket,
    expires: 1000 * 60 * 60 * 24,
    returnBody:
      '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)"}'
  });
  var mac = new qiniu.auth.digest.Mac(conf.accessKey, conf.secretKey);

  this.uploadToken = putPolicy.uploadToken(mac);
  this.formUploader = new qiniu.form_up.FormUploader(qnconfig);
  this.logger =logger= log4js.getLogger(conf.loggerCategory || 'Qiniu upload');
  this.logger.level = 'all';

  //如果上传前需要删除同名文件，先构建buketManager
  if (conf.removeBeforeUpload) {
    this.buketManager = new qiniu.rs.BucketManager(mac, qnconfig);
  }

  //如果需要刷新缓存，或者是文件预取，先构建cdnManager
  if (conf.refresh || conf.prefetch) {
    if (!conf.host || !DOMAIN_REG.test(conf.host))
      throw new Error('[Qiniu upload]Invalid host:' + conf.host);
    this.cdnManager = new qiniu.cdn.CdnManager(mac);
  }
}

/**
 * 上传一个文件
 * @param {string} key 文件名
 * @param {string} localFile 本地文件路径
 */
QiniuDirUploader.prototype.uploadFile = function(key, localFile) {
  var extname = path.extname(localFile);
  var mime = MIMETypeMapper[extname];
  var putExtra = new qiniu.form_up.PutExtra(null, null, mime);

  var self = this;
  return new Promise(function(resolve, reject) {
    self.formUploader.putFile(
      self.uploadToken,
      key,
      localFile,
      putExtra,
      responseHandlerFactory(resolve, reject,self.config.debugger)
    );
  });
};
QiniuDirUploader.prototype.removeFile = function(fileName) {
  var self = this;

  return new Promise(function(resolve, reject) {
    var bucketManager = self.buketManager;
    var bucket = self.config.bucket;
    bucketManager.delete(
      bucket,
      fileName,
      responseHandlerFactory(resolve, reject,self.config.debugger)
    );
  });
};

QiniuDirUploader.prototype.refreshFileCache = function(fileName) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var cdnManager = self.cdnManager;
    var host = self.config.host;
    var refreshUrls = ['http://' + host + fileName];
    if (self.config.https) {
      refreshUrls.push('https://' + host + fileName);
    }
    cdnManager.refreshUrls(
      refreshUrls,
      responseHandlerFactory(resolve, reject,self.config.debugger)
    );
  });
};

QiniuDirUploader.prototype.prefetchFile = function(fileName) {
  var self = this;
  return new Promise(function(resolve, reject) {
    var cdnManager = self.cdnManager;
    var host = self.config.host;
    var urls = ['http://' + host + fileName];

    if (self.config.https) {
      urls.push('https://' + host + fileName);
    }

    cdnManager.prefetchUrls(urls, responseHandlerFactory(resolve, reject,self.config.debugger));
  });
};
QiniuDirUploader.prototype.readDir = function(dir, callback) {
  var self = this;
  var conf = this.config;

  fs.readdir(dir, function(err, files) {
    if (err) throw err;
    files.forEach(function(file) {
      var filePath = dir + '\\' + file;

      fs.stat(filePath, function(err, stat) {
        if (err) throw err;

        if (stat.isDirectory()) {
          return self.readDir(filePath, callback);
        }

        var extname = path.extname(filePath);

        if (conf.excludes.indexOf(extname) > -1) {
          return;
        }
        callback && callback.call(self, filePath);
      });
    });
  });
};

/**
 * 读取并上传一个目录里面的所有文件
 */
QiniuDirUploader.prototype.upload = function() {
  var self = this;
  var conf = this.config;
  var logger = this.logger;

  this.readDir(conf.buildAssetsRoot, function(filePath) {
    var key = /** @type {string} */ (filePath).replace(
      conf.buildAssetsRoot,
      conf.publishAssetsRoot
    );
    key = key.replace(/\\/g, '/');

    var prefetchFile = function() {
      self
        .prefetchFile(key)
        .then(function() {
          logger.info('Prefetch file: "' + key + '" successful');
        })
        .catch(function(err) {
          logger.error('Prefetch file: "' + key + '" failed');
          if(conf.debugger){
            throw err;
          }
        });
    };
    var onUploadSuccess = function() {
      logger.info(
        'Upload file: "' + filePath + '" to "' + key + '" successful'
      );
      if (conf.prefetch === PrefechType.AfterUpload) {
        prefetchFile();
      }

      if (conf.refresh) {
        self
          .refreshFileCache(key)
          .then(function() {
            logger.info('Refresh file: "' + key + '" successful');
            if (conf.prefetch === PrefechType.AfterRefresh) {
              prefetchFile();
            }
          })
          .catch(function(err) {
            logger.error('Refresh file: "' + key + '" failed');
            if(conf.debugger){
              throw err;
            }
          });
      }
    };
    var onUploadError = function(err) {
      logger.error('File: "' + filePath + '" upload failed');
      if(conf.debugger){
        throw err;
      }
    };

    if (self.config.removeBeforeUpload) {
      self
        .removeFile(key)
        .then(function() {
          logger.warn('Remove remote file:"' + key + '" successful.');
          self
            .uploadFile(key, filePath)
            .then(onUploadSuccess)
            .catch(onUploadError);
        })
        .catch(function(err) {
          logger.error('Remove remote file:"' + key + '" failed.');
        });
    } else {
      self
        .uploadFile(key, filePath)
        .then(onUploadSuccess)
        .catch(onUploadError);
    }
  });
};

QiniuDirUploader.getUploader = function(conf) {
  return new QiniuDirUploader(conf);
};

/**
 *
 * @param {(resp:any)=>any} resolve
 * @param {(reson:any)=>any} reject
 * @param {boolean} [debug]
 */
function responseHandlerFactory(resolve, reject,debug) {
  /**
   * @param {Error} err
   */
  return function(err, respBody, respInfo) {

    if(debug){
      logger.debug(JSON.stringify(respBody));
      logger.debug(JSON.stringify(respInfo));
    }

    if (err) {
      
      reject(err);
    }
    if (respInfo.statusCode == 200) {
      resolve(respInfo);
    } else {
      reject(err);
    }
  };
}

module.exports = QiniuDirUploader;

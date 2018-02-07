import qiu from 'qiniu'
import log4js from 'log4js'

interface UploadOption {
  /**
   * 空间名
   */
  bucket: string;

  /**
   * accessKey
   */
  accessKey: string;
  /**
   * secretKey
   */
  secretKey: string;
  /**
   * 要排除的文件后缀名
   */
  excludes: string[];
  /**
   * 打包资源根目录
   */
  buildAssetsRoot: string;
  /**
   * 发布资源根目录，（即七牛上的目录）
   */
  publishAssetsRoot: string;

  /**
   * log4js category，默认:upload
   */
  loggerCategory?: string;

  /**
   * 机房位置，默认华东
   */
  zone?:string;
}

interface ReaddirCallback{
  (filePath:string);
}

export class QiniuDirUploader{
  config:UploadOption;
  uploadToken:string;
  formUploader:qiu.form_up.FormUploader;
  logger:log4js;
  constructor(option:UploadOption);
  uploadFile(key:string,localFile:string):void;
  readDir(callback:ReaddirCallback):void;
  upload():void;
}
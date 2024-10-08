# qiniu-dir-uploader

A directory uploader for Qiniu.
上传一个文件夹中的所有文件到七牛，并保持目录结构

## Install

```bash
  yarn add qiniu-dir-uploader -D
  #or
  npm i qiniu-dir-uploader --save-dev
```

## Usage

upload.js

```js
var path=require('path');
var qiniu=require('qiniu');
var QiniuDirUploader=require('qiniu-dir-uploader');
var option={
  secretKey:'secretKey',
  accessKey:'accessKey',
  bucket:'bucket',
  excludes:['.html'],
  buildAssetsRoot:path.join(__dirname,'./dist'),
  publishAssetsRoot:'root',
  loggerCategory:'upload',
  zone:qiniu.zone.Zone_z0,
  removeBeforeUpload:true,
  refresh:true,
  prefetch:2,
  https:true,
  host:'cdn.qiniu.com',
    keep:false
};

var uploader=QiniuDirUploader.getUploader(option);
//or
var uploader=new QiniuDirUploader(option);

//start upload
uploader.upload();
```

package.json

```json
{
  "scripts":{
    "build": "node build.js",
    "postbuild": "node upload.js",
    "upload":"node upload.js"
  }
}
```

```bash
yarn run build
#or
yarn run upload
```

## 参数说明

七牛相关参数的详细说明，[请看七牛文档](https://developer.qiniu.com/kodo/sdk/1289/nodejs)

```ts
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
   * @example "D:\\dev\\project\\dist"
   */
  buildAssetsRoot: string;
  /**
   * 发布资源根目录，（即七牛上的目录）
   * @example "app"
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
   /**
   * 上传前是否删除同名文件,默认不删除
   */
  removeBeforeUpload?:boolean;
  /** 上传完成后是否刷新缓存 ，默认不刷新*/
  refresh?:boolean;
  /** 是否预取文件，默认不预取，1 ：上传完成后预取，2：刷新后预取*/
  prefetch?:1|2;
  /** 
   * 对应的CDN空间域名。如果需要刷新缓存或是预取文件，则不能为空 
   * @example cdn.qiniu.com
   **/
  host?:string;
  /** 
   * 刷新或预取文件时，是否同时刷新或预取https 
   * @default false
   **/
  https?:boolean;
  /**
   * 是否开启调式模式，调式模式下，会打印出所有七牛接口的响应信息
   * @default false
   */
  debugger?:boolean;
    /**
     * 上传时，是否保持目录结构，默认保持
     * @default true
     */
  keep?:boolean;
}

```
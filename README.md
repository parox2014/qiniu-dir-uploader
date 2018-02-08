# qiniu-dir-uploader

A directory uploader for Qiniu.
上传一个文件夹中的所有文件到七牛，并保持目录结构

## 安装

```bash
  yarn add qiniu-dir-uploader -D
  #or
  npm i qiniu-dir-uploader --save-dev
```

## 使用

publish.js

```js
var path=require('path');
var qiniu=require('qiniu');
var qdu=require('qiniu-dir-uploader');
var option={
  secretKey:'secretKey',
  accessKey:'accessKey',
  bucket:'bucket',
  excludes:['.html'],
  buildAssetsRoot:path.join(__dirname,'./dist'),
  publishAssetsRoot:'root',
  loggerCategory:'upload',
  zone:qiniu.zone.Zone_z0
};

var uploader=qdu.getUploader(option);
//or
var uploader=new qdu.QiniuDirUploader(option);

//start upload
uploader.upload();
```

package.json

```json
{
  scripts:{
    "build": "node build.js",
    "postbuild": "node publish.js",
    "pub":"node publish.js"
  }
}
```

```bash
yarn run build
#or
yarn run pub
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

```
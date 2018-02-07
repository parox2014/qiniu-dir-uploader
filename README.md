# qiniu-dir-uploader

A dirctory uploader for Qiniu.
上传一个文件夹中的所有文件到七牛，并保持目录结构

## 安装

```bash
  yarn add qiniu-dir-uploader -D
  npm i qiniu-dir-uploader --save-dev
```

## 使用

publish.js

```js
var path=require('path');
var qiniu=require('qiniu');
var QiniuDirUploader=require('qiniu-dir-uploader');

var uploader=new QiniuDirUploader({
  secretKey:'secretKey',
  accessKey:'accessKey',
  bucket:'bucket',
  excludes:['.html'],
  buildAssetsRoot:path.join(__dirname,'./dist'),
  publishAssetsRoot:'root',
  loggerCategory:'upload',
  zone:qiniu.zone.Zone_z0
});

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
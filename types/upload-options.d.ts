export interface UploadOption {
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
   * 机房位置，默认华东
   */
  zone?: string;
  /**
   * 上传前是否删除同名文件,默认不删除
   */
  removeBeforeUpload?:boolean;
  /** 上传完成后是否刷新缓存 ，默认不刷新*/
  refresh?:boolean;
  /** 是否预取文件，默认不预取，1 ：上传完成后预取，2：刷新后预取*/
  prefetch?:1|2;
  /** 
   * CDN文件域名。如果需要刷新缓存或是预取文件，则不能为空 
   * @example cdn.qiniu.com
   **/
  host?:string;
  /** 
   * 刷新或预取文件时，是否同时刷新或预取https 
   * @default false
   **/
  https?:boolean;
  /**
   * 是否开启调式模式，调式模式下，会打应出所有的响应信息
   * @default false
   */
  debugger?:boolean;
}

declare module "upload-options"{
  export = UploadOption
}
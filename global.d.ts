declare namespace qdu {
  enum Zone{
    EastChina='z0',
    NorthChina='z1',
    SouthChina='z2',
    NorthAmerica='na0'
  }

  interface UploadOption {
    /**
     * 空间名
     */
    bucket: string;
    accessKey: string;
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
     * log4js category
     */
    loggerCategory: string;

    /**
     * 机房位置
     */
    zone:Zone;
  }
}
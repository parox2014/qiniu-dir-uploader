var Uplaoder=require('./lib/qiniu-dir-uploader');
var uploader=Uplaoder.getUploader({
    bucket: '',
    accessKey: '',
    secretKey: '',
    refresh: false,
    host: '',
    https: true,
    keep:true,
    buildAssetsRoot:'./qiniu-dir-uploader-test',
    publishAssetsRoot:'qiniu-dir-uploader-test',
})
uploader.upload()

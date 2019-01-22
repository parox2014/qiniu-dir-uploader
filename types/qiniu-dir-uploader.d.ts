import qiu from 'qiniu'
import { UploadOption } from './upload-options';

declare module "qiniu-dir-uploader" {
  
  class QiniuDirUploader {
    config: UploadOption;
    uploadToken: string;
    formUploader: qiu.form_up.FormUploader;
    constructor(option: UploadOption);
    uploadFile(key: string, localFile: string): void;
    readDir(callback: (filePath: string) => void): void;
    upload(): void;
    static getUploader(options: UploadOption): QiniuDirUploader;
  }

  export = QiniuDirUploader;
}
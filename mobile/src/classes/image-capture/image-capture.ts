import { Camera, CameraOptions } from '@ionic-native/camera';
import { File } from '@ionic-native/file';

export class ImageCapture {
    constructor(public camera: Camera, private file: File) {
    }

    // Get image either from camera or photo library
    loadImage(cameraSourceType: number) {
        return new Promise( (resolve, reject) => {
            const cameraOptions: CameraOptions = {
                sourceType: cameraSourceType,
                destinationType: this.camera.DestinationType.FILE_URI,
                quality: 100,
                encodingType: this.camera.EncodingType.JPEG,
                mediaType: this.camera.MediaType.PICTURE,
                targetWidth: 400,
                targetHeight: 400,
                correctOrientation: true
            };

            this.camera.getPicture(cameraOptions).then((path) => {
                const imagePath = path.substr(0, path.lastIndexOf('/') + 1);
                const imageName = path.substr(path.lastIndexOf('/') + 1);
                this.file.readAsDataURL(imagePath, imageName).then((imageData) => {
                    resolve(imageData);
                });
            }, (err) => {
              reject(err);
            });
       });
    }
}

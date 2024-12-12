///////////// 28-FEB-2024 ///////////////
// Directive for all videos which are encrypted and needs to be decrypt at Front end //

import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import * as CryptoJS from 'crypto-js';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

@Directive({
  selector: 'video source'
})
export class VideoDecryptDirective {

  constructor(private el: ElementRef,private http:HttpClient) {
  }

  // Let video play smoothly without doing anything but if there is any error then execute decryption
  @HostListener('error')
  onError() {
    const sourceElement: HTMLSourceElement = this.el.nativeElement;
    const videoUrl = sourceElement.src;
    // Checking that it should be a video not Live stream
    if (!videoUrl.toLowerCase().endsWith('.m3u8')){
      const decryptionKey = JSON.parse(sessionStorage.getItem('site-config')).image_decryption_key
      this.decryptVideoData(videoUrl,decryptionKey,sourceElement).subscribe();
    }
  }

  // Function for decrypting video data. This is exactly same as for encrypted image. We are converting it in Blob at the end to avoid a long base64 string on video src.
  decryptVideoData( videoUrl: string, decryptionKey: string,sourceElement:HTMLSourceElement) {
    return this.http.get(videoUrl, { observe: 'response', responseType: 'blob' })
      .pipe(map((res: any) => {
        let actualBlob = new Blob([res.body], { type: res.headers.get('Content-Type') });
        let a = decryptionKey;
        let reader = new FileReader();
        reader.readAsDataURL(actualBlob);
        reader.onloadend = () => {
          let base64data: any = reader.result;
          base64data = atob(base64data.split(',')[1]);
          let rawData = atob(base64data);
          let iv: any = rawData.substring(0, 16);
          let crypttext: any = rawData.substring(16);
          crypttext = CryptoJS.enc.Latin1.parse(crypttext);
          iv = CryptoJS.enc.Latin1.parse(iv);
          let b = CryptoJS.enc.Utf8.parse(a);
          let ciphertext: any = { ciphertext: crypttext };
          let plaintextArray: any = CryptoJS.AES.decrypt(
            ciphertext,
            b,
            { iv: iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }
          );
          let finalImg = CryptoJS.enc.Latin1.stringify(plaintextArray);
          finalImg = finalImg.slice(2, finalImg.length - 1);
          // Attaching decrypted chunk to video src
          sourceElement.src =  this.convertToBlobObject(finalImg);
          // Video tag is parent element of source tag so it needs to be accessed to load the video
          const videoElement = sourceElement.parentElement as HTMLVideoElement;
          videoElement.load();
          videoElement.play();
        }
      }
    ));
  }

  // A function for converting base64 media data into blob object.
  // It is necessary to handle larger base64 string to avoid glitches in the browser.
  convertToBlobObject(base64data:string){
    const byteCharacters = atob(base64data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'video/mp4' });
    // Create a URL for the Blob
    const url = URL.createObjectURL(blob);
    return url;
  }
}

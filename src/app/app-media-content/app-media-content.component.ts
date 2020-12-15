import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MediaContent } from './media.model';

@Component({
  selector: 'app-media-content',
  templateUrl: './app-media-content.component.html',
  styleUrls: ['./app-media-content.component.scss']
})
export class AppMediaContentComponent implements OnInit {

  @Output() closeMediaModal: EventEmitter<any> = new EventEmitter();
  @Input()
  set mediaInfo(media: MediaContent) {
    if (media) {
      this.media = media;
      if (media.type === 'video') this.media.url = this.checkUrl(media.url);
    }
  }

  media: any;

  constructor(
    private sanitizer: DomSanitizer,
  ) { }

  ngOnInit() {

  }

  checkUrl(urlMedia: string) {
    const key = 'watch?v=';
    if (urlMedia.includes(key)) {
      urlMedia = urlMedia.replace(key, 'embed/');
    }
    // Securize URL
    return this.sanitizer.bypassSecurityTrustResourceUrl(urlMedia);
  }

  close() {
    this.closeMediaModal.emit(true);
    this.media = {};
  }

}

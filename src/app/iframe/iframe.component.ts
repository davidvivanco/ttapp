import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-iframe',
  templateUrl: './iframe.component.html'
})
export class IframeComponent implements OnInit {
  url;
  webUrlSafe: SafeResourceUrl;
  mySubscription: any;
  finishLoading = false;
  constructor(private sanitizer: DomSanitizer,
    private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['url']) {
        this.webUrlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(params['url']);
        this.finishLoading = true;
      }
    });
  }
}

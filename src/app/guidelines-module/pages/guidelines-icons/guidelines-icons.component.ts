import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-guidelines-icons',
  templateUrl: './guidelines-icons.component.html',
  styleUrls: ['../basic/guidelines.component.scss']
})
export class GuidelinesIconsComponent implements OnInit {

  safeUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://material.io/resources/icons/?style=baseline');
  }

}

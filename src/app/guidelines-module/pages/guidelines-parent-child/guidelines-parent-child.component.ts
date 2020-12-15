import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';


@Component({
  selector: 'app-guidelines-parent-child',
  templateUrl: './guidelines-parent-child.component.html',
  styleUrls: ['../basic/guidelines.component.scss']
})
export class GuidelinesParentChildComponent implements OnInit {

  safeUrl: SafeResourceUrl;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.safeUrl = this.sanitizer.bypassSecurityTrustResourceUrl('https://stackblitz.com/angular/vqlemlxeakq?file=src%2Fapp%2Fastronaut.component.ts');
  }

}

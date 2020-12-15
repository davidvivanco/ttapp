import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-breadcrumb',
  templateUrl: './breadcrumb.component.html',
  styleUrls: ['./breadcrumb.component.scss']
})
export class BreadcrumbComponent {

  bread;
  @Input()
  set breadcrumbs(breadcrumbs: string) {
    this.bread = breadcrumbs;
    this.loadBreadcrumbs();
  }
  data: string[];
  constructor() { }

  loadBreadcrumbs() {
    if (this.bread) {
      this.data = this.bread ? this.bread.split(',') : [];
    }
  }

}

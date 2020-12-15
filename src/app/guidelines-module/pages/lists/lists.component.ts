import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-lists',
  templateUrl: './lists.component.html',
  styleUrls: ['../basic/guidelines.component.scss']
})
export class ListsComponent implements OnInit {

  ordered = `<ul class="ordered-list">
  <li class="item-listed no-border f-n" *ngFor="let item of [1,2,3,4,5]; let i = index">
    Item de lista {{i}}
  </li>
</ul>`;

  unordered = `<ul class="unordered-list">
  <li class="item-listed no-border f-n" *ngFor="let item of [1,2,3,4,5]; let i = index">
    Item de lista {{i}}
  </li>
</ul>`;

  constructor() { }

  ngOnInit() {
  }

}

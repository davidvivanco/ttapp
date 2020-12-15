import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-links',
  templateUrl: './links.component.html'
})
export class LinksComponent implements OnInit {

  @Input()
  set subMenu(subMenu) {
    if (subMenu) {
      this.item = subMenu;
    }
  }

  @Output() launchModal = new EventEmitter();
  @Output() childHideMenu = new EventEmitter();

  item: any;

  constructor( ) { }

  ngOnInit() {
  }

  hideMenu() {
    this.childHideMenu.emit();
  }

  modalType(item) {
    this.launchModal.emit(item);
  }

}

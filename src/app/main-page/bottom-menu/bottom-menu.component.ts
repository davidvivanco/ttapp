import { Component, Inject, OnInit} from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material';
import { EventService } from 'src/app/shared/services/event.service';

@Component({
  selector: 'app-bottom-menu',
  templateUrl: './bottom-menu.component.html'
})
export class BottomMenuComponent implements OnInit {

  menuBottom = [];
  selected: any;

  constructor(
    private _bottomSheetRef: MatBottomSheetRef<BottomMenuComponent>,
    @Inject(MAT_BOTTOM_SHEET_DATA) public data: any,
    private eventService: EventService) {
      this.menuBottom = data;
    }

  ngOnInit() {}

  openLink(item): void { // Esta funcion sobra
    this._bottomSheetRef.dismiss();
  }

  dismissBottomDrawer(event: MouseEvent): void {
    this._bottomSheetRef.dismiss();
    event.preventDefault();
  }

  toggleMenu(menu, noDrawer) {
    this.eventService.bottomToggleMenu.emit({menu: menu, noDrawer: noDrawer});
  }

  modalType(link) {
    this.eventService.bottomLaunchModal.emit(link);
  }

}

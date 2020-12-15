import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { speedDialFabAnimations } from './speed-dial-fab.animations';


@Component({
  selector: 'app-speed-dial-fab',
  templateUrl: './speed-dial-fab.component.html',
  styleUrls: ['./speed-dial-fab.component.scss'],
  animations: speedDialFabAnimations
})
export class SpeedDialFabComponent implements OnInit {

  @Input('buttons') fabButtons = [];
  @Output('fabClick') fabClick = new EventEmitter();

  buttons = [];
  fabTogglerState = 'inactive';
  constructor() { }

  ngOnInit() {
  }


  private showItems() {
    this.fabTogglerState = 'active';
    this.buttons = this.fabButtons;
  }

  private hideItems() {
    this.fabTogglerState = 'inactive';
    this.buttons = [];
  }

  public onToggleFab() {
    this.buttons.length ? this.hideItems() : this.showItems();
  }

  public onClickFab(btn) {
    this.hideItems();
    this.fabClick.emit(btn.pos);
  }
}

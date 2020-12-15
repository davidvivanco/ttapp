import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-block-card',
  templateUrl: './block-card.component.html',
  styleUrls: ['./block-card.component.scss']
})
export class BlockCardComponent {
  @Input() title: string;

  constructor() {}
}

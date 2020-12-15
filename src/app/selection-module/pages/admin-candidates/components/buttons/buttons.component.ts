import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-buttons',
  templateUrl: './buttons.component.html'
})
export class ButtonsComponent {

  @Output() onBack = new EventEmitter();
  @Output() onCandidatures = new EventEmitter();
  @Output() onCurriculum = new EventEmitter();
  @Output() onPersonalData = new EventEmitter();

  @Input() component: string;



  constructor() { }

  goBack = () => this.onBack.emit();

  goToCandidatures = () => this.onCandidatures.emit();

  goToCurriculum = () => this.onCurriculum.emit();

  goToPersonalData = () => this.onPersonalData.emit();
}

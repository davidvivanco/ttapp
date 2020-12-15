import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

interface SliderOptions {
  min: number
  max: number
  step: number
  value: number
}

@Component({
  selector: 'app-slider',
  templateUrl: './slider.component.html',
  styleUrls: ['./slider.component.scss']
})
export class SliderComponent implements OnInit {
  @Input() sliderOptions: SliderOptions
  @Output() sliderChange: EventEmitter<number>

  constructor() {
    this.sliderChange = new EventEmitter();
  }

  ngOnInit() {
  }

  formatLabel(value: number) {
    return value;
  }

  sliderOnChange(e) {
    this.sliderChange.emit(e.value)
  }


}

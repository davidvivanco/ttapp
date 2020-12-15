import { Component, HostListener, Input, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';

@Component({
  selector: 'app-description',
  templateUrl: './description.component.html',
  styleUrls: ['./description.component.scss']

})
export class DescriptionComponent implements OnInit {

  formGroup: FormGroup;
  @Input() description: string;
  @Input() legend: any;
  public innerWidth: any;

  constructor(private formBuilder: FormBuilder,
  ) { }

  ngOnInit() {
    this.formGroup = this.formBuilder.group({
      description: [this.description, []]
    });
    this.innerWidth = window.innerWidth;
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.innerWidth = window.innerWidth;
  }
}

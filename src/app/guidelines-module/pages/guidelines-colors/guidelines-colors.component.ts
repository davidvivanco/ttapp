import { Component, OnInit } from '@angular/core';

const ELEMENT_DATA: any[] = [
  {class: 'primary', font: '.primary', background: 'bg-primary', hex: 'var(--primary-color)'},
  {class: 'secondary', font: '.secondary', background: 'bg-secondary', hex: 'var(--secondary-color)'},
  {class: 'blue', font: '.blue', background: 'bg-blue', hex: '#1166aa'},
  {class: 'red', font: '.red', background: 'bg-red', hex: '#E84349'},
  {class: 'dark', font: '.dark', background: 'bg-dark', hex: '#333F48'},
  {class: 'light', font: '.light', background: 'bg-light', hex: '#EFEFEF'},
  {class: 'gray', font: '.gray', background: 'bg-gray', hex: '#555555'},
  {class: 'green', font: '.green', background: 'bg-green', hex: '#84bd00'},
  {class: 'orange', font: '.orange', background: 'bg-orange', hex: '#f57c00'},
  {class: 'yellow', font: '.yellow', background: 'bg-yellow', hex: '#fff600'},
];

@Component({
  selector: 'app-guidelines-colors',
  templateUrl: './guidelines-colors.component.html',
  styleUrls: ['../basic/guidelines.component.scss']
})
export class GuidelinesColorsComponent implements OnInit {

  displayedColumns: string[] = ['class', 'font', 'background', 'hex'];
  dataSource = ELEMENT_DATA;

  constructor() { }

  ngOnInit() {
  }

}

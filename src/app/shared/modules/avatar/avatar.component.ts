import { Component, Input, OnChanges, OnInit, SimpleChange } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Employee } from '../../models/employee.model';

@Component({
  selector: 'app-avatar',
  templateUrl: './avatar.component.html'
})
export class AvatarComponent implements OnInit, OnChanges {
  @Input() photoUrl: any;
  @Input() user: Employee;
  url = environment.url; // mirar donde va a ser el bucket
  resources = environment.resources;
  fallbackProfilePhoto: string;
  pic: string;

  constructor() {
  }

  ngOnInit() {
    this.pic = this.getPhoto();
  }

  ngOnChanges(changes: { [propertyName: string]: SimpleChange }) {
    if (changes['url'] && this.url) {
      this.user.personalData.photo = this.url;
    }

    let gender = this.user.personalData.gender || '';
    gender = gender.toLowerCase();
    this.fallbackProfilePhoto = this.getFallBackPhoto(gender);
    this.pic = this.getPhoto();
  }

  private getFallBackPhoto(gender) {
    if (gender === 'f') {
      return `${this.resources}images/avatar_female.jpg`;
    } else if (gender === 'm') {
      return `${this.resources}images/avatar_male.jpg`;
    } else if (gender === 'u') {
      return `${this.resources}images/avatar_neutral.jpg`;
    }
  }

  getPhoto(): string {
    if (!this.user || !this.user.personalData.photo || this.user.personalData.photo === '') return this.fallbackProfilePhoto;
    return this.user.personalData.photo;
  }
}

import {Component, Input} from '@angular/core';
import {fadeInOut} from '../animate';

const controlMessages = {
  required: 'Este campo es requerido',
  minlength: 'La contraseña debe tener al menos 4 carácteres',
  email: 'El campo debe tener formato de email',
  confirmPassword: 'Las contraseñas no coinciden'
};

@Component({
  selector: 'app-error-messages',
  templateUrl: './error-messages.component.html',
  styleUrls: ['./error-messages.component.scss'],
  animations: [fadeInOut]

})
export class ErrorMessagesComponent {
  @Input() control;

  constructor() {
  }
  /**
   * Maps forms error messages with corresponding translation
   */
  get errorMessage() {
    if (this.control.touched) {

      for (const propertyName in this.control.errors) {

        if (this.control.errors.hasOwnProperty(propertyName)) {

          return controlMessages[propertyName];
        }
      }
    }
    return null;
  }
}

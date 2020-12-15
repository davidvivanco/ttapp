import { Injectable } from '@angular/core';
import { Employee } from './shared/models/employee.model';

@Injectable()

export class CommonFunctions {

  user: Employee;

  static getCleanedString(cadena) { // funcion para limpiar strings de acentos y mayusculas
    return cadena.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();  // quita acento español y catalán
  }

  constructor() {
  }


  isObject(item) {
    return (item && typeof item === 'object' && !Array.isArray(item));
  }

  clone = (object) => JSON.parse(JSON.stringify(object));


  assignsVars(that, ...data) {
    if (!data.length) return that;
    const source = data.shift();

    if (this.isObject(that) && this.isObject(source)) {
      for (const key in source) {
        if (this.isObject(source[key])) {
          if (!that[key]) Object.assign(that, { [key]: {} });
          this.assignsVars(that[key], source[key]);
        } else {
          Object.assign(that, { [key]: source[key] });
        }
      }
    }

    return this.assignsVars(that, ...data);
  }

  fillUserId(word, size = 5, fill = '0') {
    if (!word) return null;
    word = word + '';
    return word.length >= size ? word : new Array(size - word.length + 1).join(fill) + word;
  }

  isBase64(str) {
    if (str === '' || str.trim() === '') { return false; }
    try {
      return btoa(atob(str)) === str;
    } catch (err) {
      return false;
    }
  }

  generateId = (length, lengthBlock): string => {
    let characters = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let pass = '';
    for (let index = 0; index < length; index++) {
      let passBlock = '';
      for (let i = 0; i < lengthBlock; i++) {
        passBlock += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      pass += (pass === '') ? passBlock : '-' + passBlock;

    }
    return pass;
  };


  toTitleCase = (str) => {
    return str.replace(/\w\S*/g, (txt) => {
      return (txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()).toString('utf8');
    });
  };


}

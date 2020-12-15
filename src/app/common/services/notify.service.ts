import { MatSnackBar } from '@angular/material';
import { Injectable } from '@angular/core';

@Injectable()
export class NotifyService {
  static snackBarDefaultProps = {
    duration: 2000,
    verticalPosition: 'top',
    horizontalPosition: 'end',
    panelClass: []
  };
  
  constructor(private snackBar: MatSnackBar) { }

  success(message) {
    this.snackBar.open(message, null, {
      ...<any>NotifyService.snackBarDefaultProps,
      panelClass: ['toast-ok'],
    });
  }

  error(message) {
    this.snackBar.open(message, null, {
      ...<any>NotifyService.snackBarDefaultProps,
      duration: 5000,
      panelClass: ['toast-error'],
    });
  }
}

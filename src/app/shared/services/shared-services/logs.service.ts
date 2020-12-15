import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material';

@Injectable()
export class LogsService {
    private isToastVisible: boolean;

    constructor(
        private http: HttpClient,
        private snackBar: MatSnackBar,
    ) {
    }

    log(message, panelClass = 'toast-ok') {
        this.snackBar.open(message, null, {
            duration: 2000,
            verticalPosition: 'top',
            horizontalPosition: 'end',
            panelClass: [panelClass],
        });
    }

    logNotification(message, panelClass = 'toast-notification') {
        this.snackBar.open(message, null, {
            duration: 2000,
            verticalPosition: 'top',
            horizontalPosition: 'end',
            panelClass: [panelClass],
        });
    }

    logLoading(message, panelClass = 'toast-ok-blue') {
        this.snackBar.open(message, null, {
            duration: 0,
            verticalPosition: 'top',
            horizontalPosition: 'end',
            panelClass: [panelClass],
        });
    }

    logError(message) {
        if (this.isToastVisible) return;
        this.isToastVisible = true;

        this.snackBar.open(message, null, {
            duration: 5000,
            verticalPosition: 'top',
            horizontalPosition: 'end',
            panelClass: ['toast-error'],
        }).afterDismissed().subscribe(() => {
            this.isToastVisible = false;
        });
    }
}

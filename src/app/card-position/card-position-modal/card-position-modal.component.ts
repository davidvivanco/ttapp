import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
@Component({
    selector: 'app-card-position-modal',
    templateUrl: './card-position-modal.component.html'
})
export class CardPositionModalComponent {

    fromModal = true;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<CardPositionModalComponent>) { }

    close(): void {
        this.dialogRef.close();
    }
}

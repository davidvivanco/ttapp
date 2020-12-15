import { Component, Inject } from '@angular/core';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ApiService } from 'src/app/shared/services/api.service';

@Component({
    selector: 'app-personal-data-modal',
    templateUrl: 'personal-data-modal.component.html',
})
export class PersonalManagerDataModalComponent {
    employee$: any;

    constructor(public apiService: ApiService, public dialogRef: MatDialogRef<PersonalManagerDataModalComponent>, @Inject(MAT_DIALOG_DATA) public data) {
        this.employee$ = data.employeeId;
    }

    close(): void {
        this.dialogRef.close();
    }
}

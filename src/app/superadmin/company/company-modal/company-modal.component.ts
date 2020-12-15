import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';



@Component({
    selector: 'app-company-modal',
    templateUrl: 'company-modal.component.html',
    styleUrls: ['company-modal.component.scss']
})
export class CompanyModalComponent implements OnInit {

    formGroup: FormGroup;
    loading = false;
    isNew: boolean;
    availableGroups: any;
    filteredGroups = [];
    modulesAvailables: [];
    extras;
    suscription;
    constructor(
        public dialogRef: MatDialogRef<CompanyModalComponent>,
        private formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any,

    ) {
        this.availableGroups = data.availableGroups;
        this.modulesAvailables = data.modules.default;
        this.extras = data.modules.extra;
        this.suscription = data.suscription;
    }

    ngOnInit() {
    }

    close(): void {
        this.dialogRef.close();
    }

}

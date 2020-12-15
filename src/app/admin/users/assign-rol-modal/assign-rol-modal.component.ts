import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { ApiService } from '../../../shared/services/api.service';
import { FormBuilder, ValidationErrors, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserService } from 'src/app/shared/services/user.service';
import { MatCheckboxChange } from '@angular/material';

@Component({
    selector: 'assign-rol-modal',
    templateUrl: 'assign-rol-modal.component.html',
    styleUrls: ['assign-rol-modal.component.scss']
})
export class AssignRolModalComponent implements OnInit {
    rols = [];
    formGroup: FormGroup;
    rolOpened: string;
    loading = false;
    itsMe = true;
    usuario: any;
    externalUser: boolean;
    externalUserId = '5f16ac6f81bff207594ecfd4';
    permissions;
    rolId;
    hasRolAdmin: boolean;
    static atLeastOne(formGroup: FormGroup): ValidationErrors {
        const isAtLeastOne = Object.values(formGroup.value).some(Boolean);
        let result = null;

        if (!isAtLeastOne) {
            result = { error: true };
        }

        return result;
    }
    constructor(
        public dialogRef: MatDialogRef<AssignRolModalComponent>,
        private apiService: ApiService,
        private formBuilder: FormBuilder,
        private userService: UserService,
        @Inject(MAT_DIALOG_DATA) public data: any,
    ) {
        this.rolId = '5d19fb3a3dc2de1b2c70deeb';
    }

    ngOnInit() {
        this.loading = true;
        this.apiService.getAllRols().subscribe(data => {
            this.rols = data;
            const group = {};
            this.rols.forEach(rol => (group[rol._id] = !!this.data.roles.find(rol2S => rol2S._id === rol._id)));
            this.formGroup = this.formBuilder.group(group);
            this.externalUser = this.formGroup.value['5f16ac6f81bff207594ecfd4'];
            this.loading = false;
        });

        const viewerId = this.userService.getUser().id;
        if (viewerId !== this.data.id) this.itsMe = false;

        const viewerRoles = this.userService.getUser().roles;
        this.hasRolAdmin = viewerRoles.some(rol => rol._id === this.rolId);
    }

    close(data?): void {
        this.dialogRef.close(data);
    }

    submit() {
        if (this.formGroup.invalid) {
            this.formGroup.markAsTouched();
            return;
        }

        const permissions = Object.entries(this.formGroup.value).map(([key, value]) => {
            return value ? this.rols.find(rol => rol._id === key) : null;
        }).filter(Boolean);

        this.close(permissions);
    }

    toggleRol(id) {
        this.rolOpened = id === this.rolOpened ? null : id;
    }

    rolChanged(e: MatCheckboxChange) {
        this.externalUser = this.formGroup.value[this.externalUserId];
        if (this.externalUser) { // si marcamos external user desmarcar los demás roles
            this.formGroup.reset();
            this.formGroup.controls[this.externalUserId].patchValue(true);
        }
    }
}

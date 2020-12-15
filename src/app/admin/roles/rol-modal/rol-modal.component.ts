import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef } from '@angular/material';
import { ApiService } from '../../../shared/services/api.service';
import { FormBuilder, ValidationErrors, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { permissionTitles } from '../../../shared/models/permissions-titles.model';
import { permissionDescriptions } from '../../../shared/models/permissions-descriptions.model';


const atLeast = (numb) => {
    return () => {
        return null;
    };
};
@Component({
    selector: 'app-rol-modal',
    templateUrl: 'rol-modal.component.html',
    styleUrls: ['rol-modal.component.scss']
})
export class RolModalComponent implements OnInit {
    permissions = [];
    rol: { name, description, permissions, _id };
    permissionsTitlesAux = {};
    permissionsDescAux = {};
    formGroup: FormGroup;
    loading = false;
    isNewRol: boolean;
    private logsMessagesTranslations;

    static atLeastOne(formGroup: FormGroup): ValidationErrors {
        const isAtLeastOne = Object.values(formGroup.value).some(Boolean);
        let result = null;

        if (!isAtLeastOne) {
            result = { atLeast: 'Debes escoger al menos 1 item' };
        }

        return result;
    }


    constructor(
        public dialogRef: MatDialogRef<RolModalComponent>,
        private apiService: ApiService,
        private formBuilder: FormBuilder,
        private translate: TranslateService,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) { }

    ngOnInit() {
        // this.getLogsTranslations();
        let name = '';
        let description = '';
        this.rol = this.data.rol || {};

        // console.log('rol:', this.rol._id);

        this.isNewRol = !Boolean(Object.keys(this.rol).length);

        if (!this.isNewRol) {
            name = this.rol.name;
            description = this.rol.description;
        }

        this.formGroup = this.formBuilder.group({
            name: [name, Validators.required],
            description: [description, Validators.required]
        });
        this._getAllPermissions();
    }

    getLogsTranslations(): void {
        this.translate.get(permissionTitles.concat(permissionDescriptions))
            .subscribe((translations) => {
                this.logsMessagesTranslations = translations;
            });
    }

    private _getAllPermissions() {
        this.loading = true;
        this.apiService.getAllPermissions().subscribe(async data => {
            const group = {};
            let permissions = [];

            if (!this.isNewRol) {
                permissions = this.rol.permissions;
            }

            data.forEach(item => {
                group[item._id] = Boolean(permissions.find(perm => perm._id === item._id));
            });

            this.formGroup.addControl('permissions', this.formBuilder.group(group, { validator: RolModalComponent.atLeastOne }));
            this.permissions = data;
            // console.log(this.permissions);
            this.loading = false;
            await permissions;
            await this.getLogsTranslations();
            this.getPermissionsObj();
        });
    }

    close(data?): void {
        this.dialogRef.close(data);
    }

    submit() {
        if (this.formGroup.invalid) {
            this.formGroup.markAsTouched();
            this.formGroup.get('name').markAsTouched();
            this.formGroup.get('description').markAsTouched();
            return;
        }

        const data = this.formGroup.value;
        data.permissions = Object.entries(data.permissions).map(([key, value]) => (value && key)).filter(Boolean);

        if (!this.isNewRol) {
            data._id = this.rol._id;
        }

        this.close(data);
    }

    getPermissionsObj() { // rellena el objeto al vuelo con traducciones de los títulos de permisos
        this.permissions.forEach(title => {
            this.permissionsTitlesAux[title.name] = this.logsMessagesTranslations[this.lookPermissionKey(permissionTitles, title.name)];
            this.permissionsDescAux[title.name] = this.logsMessagesTranslations[this.lookPermissionKey(permissionDescriptions, title.name)];

        });
    }

    lookPermissionKey(keys: Array<string>, name) { // busca el nombre del permiso en el objeto de traducciones para usar la traducción
        const found = keys.find(item => item.includes(name));
        return found;
    }
}

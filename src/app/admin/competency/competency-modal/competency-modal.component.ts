import {Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef } from '@angular/material';
import {FormBuilder, FormGroup, Validators } from '@angular/forms';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Competency} from '../../../shared/models/competency.model';

@Component({
    selector: 'app-competency-modal',
    templateUrl: 'competency-modal.component.html',
    styleUrls: ['competency-modal.component.scss']
  })
export class CompetencyModalComponent implements OnInit {
    competency: Competency;
    formGroup: FormGroup;
    loading = false;
    isNew: boolean;
    availableGroups: any;
    filteredGroups = [];

    constructor(
        public dialogRef: MatDialogRef<CompetencyModalComponent>,
        private formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {
        // console.log('Comp modal', data);
        this.availableGroups = data.availableGroups;
    }

    ngOnInit() {
        let name = '';
        let group = '';
        let description = '';
        let level = '';

        this.isNew = !this.data.competency;

        if(!this.isNew) {
            const competency = this.competency = this.data.competency;
            name = competency.name;
            description = competency.description;
            group = competency.group;
            level = competency.level;
        }

        this.formGroup = this.formBuilder.group({
            name: [name, Validators.required],
            group: [group, Validators.required],
            description: [description],
            level: [level]
        });
    }

    close(data?): void {
        this.dialogRef.close(data);
    }

    submit() {
        if (this.formGroup.invalid) {
            this.formGroup.get('name').markAsTouched();
            this.formGroup.get('group').markAsTouched();
            this.formGroup.get('description').markAsTouched();
            this.formGroup.get('level').markAsTouched();
            return;
        }

        const data = this.formGroup.value;
        if (!this.isNew) data._id = this.competency._id;
        this.close(data);
    }

    // AvailableGroups input predictivo
    findGroup(value, array, resultsArray) {
        resultsArray.length = 0;
        if (value !== '') {
            array.map((el, i) => {
                if (el !== undefined && el.toLowerCase().indexOf(value.toLowerCase()) !== -1) {
                    resultsArray.push(el);
                }
            });
        }
    }
    // Rellena el input con el valor recibido, y borra el array que se recibe por parámetro (usado autocompletar)
    fillInput(value, input, arrayToEmpty) {
        input.map(inp => {
            inp.value = value;
            this.formGroup.value.group = value;
        });
        arrayToEmpty.map(array => array.length = 0);
        this.formGroup.markAsDirty();
    }
}

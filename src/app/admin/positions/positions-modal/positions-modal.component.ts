import {Component, OnInit, Inject} from '@angular/core';
import {MatDialogRef } from '@angular/material';
import {FormBuilder, FormGroup, Validators } from '@angular/forms';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import {Position} from '../../../shared/models/position.model';

@Component({
    selector: 'app-positions-modal',
    templateUrl: 'positions-modal.component.html',
    styleUrls: ['positions-modal.component.scss']
  })
export class PositionsModalComponent implements OnInit {
    position: Position;
    formGroup: FormGroup;
    loading = false;
    isNew: boolean;

    constructor(
        public dialogRef: MatDialogRef<PositionsModalComponent>,
        private formBuilder: FormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any
    ) {}

    ngOnInit() {
        let name = '';
        let description = '';

        this.isNew = !this.data.position;

        if (!this.isNew) {
            const position = this.position = this.data.position;
            name = position.name;
            description = position.description;
        }

        this.formGroup = this.formBuilder.group({
            name: [name, Validators.required],
            description: [description],
        });
    }

    close(data?): void {
        this.dialogRef.close(data);
    }

    submit() {
        if (this.formGroup.invalid) {
            this.formGroup.get('name').markAsTouched();
            this.formGroup.get('description').markAsTouched();
            return;
        }
        const data = this.formGroup.value;
        if (!this.isNew) data._id = this.position._id;

        this.close(data);
    }
}

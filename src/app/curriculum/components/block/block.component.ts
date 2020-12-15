import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FieldModalComponent } from '../field-modal/field-modal.component';
import { MatDialog } from '@angular/material';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';


import { CurriculumApiService } from '../../services/curriculum.api.service';
import { DeleteConfirmationModalComponent } from '../../../shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-block',
  templateUrl: './block.component.html',
  styleUrls: ['./block.component.scss']
})
export class BlockComponent implements OnInit {
  @Output() save: EventEmitter<any> = new EventEmitter();
  @Output() cancel: EventEmitter<null> = new EventEmitter();
  @Output() isModified: EventEmitter<Boolean> = new EventEmitter();

  @Input() fields = [];
  @Input() name = '';

  form = new FormGroup({
    name: new FormControl('', [Validators.required])
  });


  blockId: string;
  newField = true;
  typesLabel = {
    text: 'Texto',
    number: 'Número',
    decisionTree: 'Árbol de Decision',
    select: 'Select',
    header: 'Título',
    radio: 'Radio',
    checkbox: 'Checkbox',
    date: 'Fecha',
    dateRange: 'Rango de Fecha',
    file: 'Archivo Adjunto'
  };

  constructor(
    private dialog: MatDialog,
    private api: CurriculumApiService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params.id) this.blockId = params.id;
    });


    if (this.name) {
      this.form.get('name').setValue(this.name);
      this.newField = false;
    }
  }

  onSave() {
    if (this.form.valid) {
      this.save.emit({ ...this.form.value, fields: this.fields });
      this.isModified.emit(false);
      this.newField = false;
    } else {
      this.markAsTouched();
    }
  }

  markAsTouched() {
    this.isModified.emit(true);
    Object.values(this.form.controls).forEach((control: FormControl) => {
      control.markAsTouched();
    });
  }

  getTypesLabel(type: string) {
    return this.typesLabel[type];
  }

  addBlock() {
    const fileFound = this.checkIfTypeFileExists();
    const dialogRef = this.dialog.open(FieldModalComponent, { data: { fileFound: fileFound } });

    dialogRef.afterClosed().subscribe(field => {
      if (field) {
        this.fields.push(field);
        this.isModified.emit(true);
      }
    });
  }

  checkIfTypeFileExists() {
    let fileFound = false;
    if (this.fields.length > 0) {
      this.fields.forEach(f => {
        if (f.type === 'file') {
          fileFound = true;
        }
      });
    }
    return fileFound;
  }

  onCancel() {
    if (this.newField) {
      this.cancel.emit({ ...this.form.value, fields: this.fields });
    } else {
      this.cancel.emit(null);
    }
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.fields, event.previousIndex, event.currentIndex);
    this.isModified.emit(true);
  }

  editField(field, i) {
    const fileFound = this.checkIfTypeFileExists();
    const dialogRef = this.dialog.open(FieldModalComponent, {
      minWidth: '40vw',
      data: { blockId: this.blockId, field: field, fileFound: fileFound }
    });

    dialogRef.afterClosed().subscribe(field2 => {
      if (field2) {
        this.fields[i] = field2;
        this.isModified.emit(true);
      }
    });
  }

  deleteField(field, index: number) {
    this.fields.splice(index, 1);
    this.isModified.emit(true);
  }
}

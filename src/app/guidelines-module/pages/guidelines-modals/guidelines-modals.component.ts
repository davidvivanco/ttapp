import {OnInit, Component, Inject} from '@angular/core';
import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-guidelines-modals',
  templateUrl: './guidelines-modals.component.html',
  styleUrls: ['../basic/guidelines.component.scss']
})
export class GuidelinesModalsComponent implements OnInit {

  dataToModal = 'Content from parent';

  modal = `<div class="close-dialog"><button mat-flat-button (click)="close()"><i class="material-icons">close</i></button></div>
  <h1 mat-dialog-title>
      Modal title
  </h1>
  <div class="mat-dialog-content">
      <p>Contenido de la modal</p>
  </div>
  <div mat-dialog-actions>
      <button mat-button (click)="close()">Cancelar</button>
      <button mat-flat-button class="btn-primary" cdkFocusInitial>Actions</button>
  </div>`;

  code = `openModal(data): void {
    const dialogRef = this.dialog.open(ModalExampleComponent, {
      width: '80vw', // Podemos indicar el ancho, el max-width, etc...
      panelClass: 'clase-custom', // Podemos añadir una clase custom
      data: { data }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }`;

  constructor(public dialog: MatDialog) { }

  ngOnInit() {
  }

  openModal(data): void {
    const dialogRef = this.dialog.open(ModalExampleComponent, {
      width: '80vw',
      panelClass: 'clase-custom',
      data: { data }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

}

@Component({
  templateUrl: 'modal.component.html',
})

export class ModalExampleComponent {

  constructor(
    public dialogRef: MatDialogRef<ModalExampleComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      console.log('Data from parent', this.data);
    }

  onNoClick(): void {
    this.dialogRef.close();
  }

  close(data?): void {
      this.dialogRef.close(data);
  }

}

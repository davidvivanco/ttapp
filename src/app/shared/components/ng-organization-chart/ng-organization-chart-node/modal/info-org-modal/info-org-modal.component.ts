import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { PersonalDataModalComponent } from 'src/app/personal-data/personal-data-modal/personal-data-modal.component';

@Component({
  selector: 'app-info-org-modal',
  templateUrl: './info-org-modal.component.html',
  styleUrls: ['./info-org-modal.component.scss']
})
export class InfoOrgModalComponent implements OnInit {

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
   public dialogRef: MatDialogRef<InfoOrgModalComponent>,
   private dialog: MatDialog
   ) { }

  ngOnInit() {
  }

  openPersonalEmployeeDataDetail(employee) {
    this.dialog.open(PersonalDataModalComponent, { data: { employeeId: employee.id, fullName: employee.fullName, modal: 'orgChart' } });
  }

  close(): void {
    this.dialogRef.close();
  }
}

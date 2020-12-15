import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DeleteConfirmationModalComponent } from 'src/app/shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';

@Component({
  selector: 'app-announcement-modal',
  templateUrl: './announcement-modal.component.html',
  styleUrls: ['./announcement-modal.component.scss']
})
export class AnnouncementModalComponent implements OnInit {
  public announcement: any;
  private formGroup: FormGroup;

  constructor(
    public dialogRef: MatDialogRef<AnnouncementModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    public dialog: MatDialog) {
    this.announcement = this.data.announcement;
    this.createForm(this.announcement);
  }

  close(data?): void {
    this.dialogRef.close(data);
  }

  createForm(announcement): void {
    this.formGroup = this.formBuilder.group({
      title: [announcement.title, []],
      category: [announcement.category, []],
      visibility: [announcement.visibility, []],
      vacancies: [announcement.vacancies, []],
      startsAt: [{ value: announcement.startsAt, disabled: true }, []],
      finishAt: [{ value: announcement.finishAt, disabled: true }, []],
      description: [announcement.description, []],
      totalVacancies: [announcement.offers.reduce((prev, cur) => parseInt(prev) + parseInt(cur.vacancies), 0), []]
    });
  }

  openModalInfo() {
    this.dialog.open(DeleteConfirmationModalComponent, { data: { title: "Info", message: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum nec eleifend lacus" }, autoFocus: false });
  }

  ngOnInit() {
  }

}

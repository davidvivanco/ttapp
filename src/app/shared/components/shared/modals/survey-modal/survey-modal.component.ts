import { Component, OnInit, Inject } from '@angular/core';
import { ApiService } from 'src/app/shared/services/api.service';
import { UserService } from '../../../../services/user.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material';


@Component({
  selector: 'app-survey-data-modal',
  templateUrl: 'survey-modal.component.html',
})
export class SurveyModalComponent implements OnInit {



  constructor(
    public apiService: ApiService,
    public userService: UserService,
    public dialogRef: MatDialogRef<SurveyModalComponent>,
    public dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {

  }

  closeModal() {
    this.dialogRef.close();
  }


}

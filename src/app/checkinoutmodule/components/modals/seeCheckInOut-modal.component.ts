import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { EventService } from '../../../shared/services/event.service';

// import { ApiService } from '../../../shared/services/api.service';
import { CheckinoutApiService } from '../../services/checkinout.api.services';

@Component({
  templateUrl: './seeCheckInOut-modal.component.html',
  styleUrls: ['./seeCheckInOut-modal.component.scss']
})
export class SeeCheckInOutModalComponent implements OnInit {
  dataSource = new MatTableDataSource<any>([]);
  loading: boolean = false;
  employee$: any;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private matDialog: MatDialog, public dialogRef: MatDialogRef<SeeCheckInOutModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data, private apiService: CheckinoutApiService, private eventService: EventService) {
    this.employee$ = data;
  }

  ngOnInit() {

  }

  closeModal() {
    this.dialogRef.close();
  }

}

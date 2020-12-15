import { Component, Inject, ViewChild, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ApiService } from 'src/app/shared/services/api.service';
import { ConfigurationService } from '../../shared/services/configuration.service';
import { PersonalDataComponent } from '../personal-data.component';

@Component({
  selector: 'app-personal-data-modal',
  templateUrl: 'personal-data-modal.component.html',
})
export class PersonalDataModalComponent implements OnInit {
  employee$: any;
  userInfo: any;
  configuration: any;
  @ViewChild(PersonalDataComponent)
  private personalDataComponent: PersonalDataComponent;

  constructor(public apiService: ApiService,
              private configurationService: ConfigurationService,
              public dialogRef: MatDialogRef<PersonalDataModalComponent>,
              @Inject(MAT_DIALOG_DATA) public data) {
    this.employee$ = data.employeeId;
    this.configuration = this.configurationService.getConfiguration();
  }
  ngOnInit(): void {
  }

  close(args?): void {
    if (args) {
      this.dialogRef.close(args);
    } else {
      this.dialogRef.close();
    }
  }

}

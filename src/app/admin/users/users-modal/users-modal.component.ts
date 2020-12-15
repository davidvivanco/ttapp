import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ApiService } from 'src/app/shared/services/api.service';
import { Employee } from '../../../shared/models/employee.model';
import { EventService } from '../../../shared/services/event.service';
import { ConfigurationService } from '../../../shared/services/configuration.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-users-modal',
  templateUrl: 'users-modal.component.html',
})
export class UsersModalComponent implements OnInit {
  employee$: any;
  newUser: Employee;
  configuration: any;
  newUserForm: FormGroup;
  emailAux: any;

  constructor(public apiService: ApiService,
    private eventService: EventService,
    private configurationService: ConfigurationService, private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<UsersModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data,
  ) {
    this.employee$ = data.employeeId;
    this.configuration = this.configurationService.getConfiguration();
    this.newUser = new Employee({});
  }
  ngOnInit(): void {
    this.createNewUserForm(this.newUser);
  }

  close(status = 'close', employee?): void {
    this.dialogRef.close({ status, employee });
  }

  createNewUserForm(user: Employee) {
    const personalData = user.personalData;
    this.newUserForm = this.formBuilder.group({
      name: [personalData.name, [Validators.required]],
      lastName: [personalData.lastName, [Validators.required]],
      gender: [user.personalData.gender, [Validators.required]],
      emailAux: [this.emailAux, [Validators.required, Validators.email]],
      email: this.formBuilder.group({
        professional: this.formBuilder.array(personalData.email.professional.map(e => this.formBuilder.control(e))),
      }),
    });
  }

  createEmailFormArray(e) {
    return this.formBuilder.control(e);
  }

  saveUser() {
    this.newUser.personalData = this.newUserForm.getRawValue();
    this.newUser.personalData.email.professional[0] = this.newUser.personalData['emailAux'];
    delete this.newUser.personalData['emailAux'];
    this.apiService.addOneEmployee(this.newUser).subscribe(res => {
      this.close('success', res);
    }, error => {
      this.close(`Error: ${error.error.message}`, null);
    });
  }
}

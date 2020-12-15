import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, FormControl } from '@angular/forms';
import { Position } from '../../../shared/models/position.model';
import { Employee } from '../../../shared/models/employee.model';
import { ApiService } from '../../../shared/services/api.service';
import { MatDialog } from '@angular/material';
import { AssignManagersModalComponent } from './assign-managers-modal/assign-managers-modal.component';
import { ChangesConfirmationModalComponent } from 'src/app/shared/components/shared/modals/changes-confirmation-modal/changes-confirmation-modal.component';
import { Unity } from 'src/app/shared/models/unity.model';
import { UnitiesApiService } from '../../unities/services/unities.api.service';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})
export class UserInfoComponent implements OnInit {
  userInfoForm: FormGroup;
  avaliablePositions: Position[];
  availableUnities: Unity[];
  formStatusDirty = false;
  formControlStatusInstance: any;
  avaliableUsers: any[];
  userOtherInfoAux: any[] = [];
  public hide = true;
  @Output() edit = new EventEmitter();
  @Output() isDirtyEvent = new EventEmitter();
  @Input() public fromModal;
  // @Input() public newEmployee: Employee;
  @Input() public employeeUserInfo;
  userManagers: any[];
  onCancelManagers: any[];
  userManagersNames = {};
  userManagersOriginalCopy: string;
  @Input() public save() {
    this.saveUserInfo();
  }

  constructor(public apiService: ApiService, private formBuilder: FormBuilder, public dialog: MatDialog, public unityApiService: UnitiesApiService) { }

  ngOnInit() {
    this.apiService.getAllPositions().subscribe(avaliablePositions => this.avaliablePositions = avaliablePositions);
    this.apiService.getEmployeeList().subscribe(avaliableUsers => this.avaliableUsers = avaliableUsers);
    this.unityApiService.getAllUnities().subscribe(availableUnities => this.availableUnities = availableUnities);
    this.userManagers = this.employeeUserInfo.managerId;
    this.userManagers = this.employeeUserInfo.managerId;
    this.onCancelManagers = [...this.employeeUserInfo.managerId];
    this.getManagersNames(this.userManagers, this.employeeUserInfo.manager);
    this.createUserInfoForm(this.employeeUserInfo);
  }

  createUserInfoForm(user: Employee) {
    // console.log(user);
    // Obtener titles de Other con espacios y mayusculas
    if (user.other) {
      for (let key in user.other) {
        const title = key.split(/(?=[A-Z])/);
        title[0] = title[0].replace(/^\w/, c => c.toUpperCase());
        const obj = { key: key, auxKey: title[0] + ' ' + title[1], value: user.other[key] };
        this.userOtherInfoAux.push(obj);
      }
    }
    // console.log(this.userOtherInfoAux);
    this.userInfoForm = this.formBuilder.group({
      id: [{ value: user.id, disabled: true }, []],
      password: [user.password, [Validators.minLength(4)]],
      confirmPassword: [''],
      managerId: [user.managerId, []],
      positionId: [user.positionId, []],
      professionalCategory: [user.professionalCategory, []], // falta saber qué hay que pintar en el input para saber qué mandar
      unityId: [user.unityId, []], // ToDo: falta poblar la entidad Unity, no tengo forma de conectarla ahora mismo
      other: this.formBuilder.group({}),
      // workplace: [user.workplace.name, []] // todo: falta saber qué pintar y de donde
    }, { validator: passwordMatchValidator });
    // Copia seg
    this.formControlStatusInstance = this.userInfoForm.getRawValue();
    delete this.formControlStatusInstance.id; // End Copia seg
    this.userManagersOriginalCopy = JSON.stringify(this.userInfoForm.controls['managerId'].value);
    // Set form control for Other Object
    // Add dynamic driverLicenses
    const otherTemp = this.userInfoForm.get('other') as FormGroup;
    this.userOtherInfoAux.forEach(e => otherTemp.addControl(e.key, new FormControl(e.value)));
    this.onChanges();
  }

  get password() { return this.userInfoForm.get('password'); }
  get confirmPassword() { return this.userInfoForm.get('confirmPassword'); }

  onPasswordInput() {
    if (this.userInfoForm.hasError('passwordMismatch')) this.confirmPassword.setErrors([{ 'passwordMismatch': true }]);
    else this.confirmPassword.setErrors(null);
    if (this.userInfoForm.controls.password.value === '') {
      this.userInfoForm.controls.password.setValidators(null);
      this.userInfoForm.controls.confirmPassword.setValidators(null);
      this.userInfoForm.controls.password.setErrors(null);
      this.userInfoForm.controls.confirmPassword.setErrors(null);
    } else {
      this.userInfoForm.controls.password.setValidators([Validators.required, Validators.minLength(4)]);
      this.userInfoForm.controls.confirmPassword.setValidators(Validators.required);
      this.userInfoForm.get('password').markAsTouched();
      this.userInfoForm.get('confirmPassword').markAsTouched();
    }
  }

  editUserInfo() {
    this.apiService.editUserInfo(this.employeeUserInfo.id, this.saveUserInfo()).subscribe((res) => {
      if (this.employeeUserInfo.unityId !== this.userInfoForm.getRawValue().unityId && this.userInfoForm.getRawValue().unityId) {
        this.unityApiService.getUnity(this.userInfoForm.getRawValue().unityId).subscribe(unity => {
          unity[0].users.push(this.employeeUserInfo._id);
          this.unityApiService.updateUnity(unity[0]._id, unity).subscribe();
        });
        if (this.employeeUserInfo.unityId) {
          this.unityApiService.getUnity(this.employeeUserInfo.unityId).subscribe(oldUnity => {
            oldUnity[0].users.splice(oldUnity[0].users.indexOf(this.employeeUserInfo._id), 1);
            this.unityApiService.updateUnity(oldUnity[0]._id, oldUnity).subscribe();
          });
        }
      }
      this.edit.emit('success');
    }, error => {
      this.edit.emit(`Error: ${error.error.message}`);
    });
  }

  openManagersModal() {
    let tempArr = JSON.parse(JSON.stringify(this.employeeUserInfo.managerId));
    this.dialog.open(AssignManagersModalComponent, {
      data: {
        userManagers: this.employeeUserInfo.managerId, managersNames: this.userManagersNames, userId: this.employeeUserInfo.id
      }
    }).afterClosed().subscribe(val => {
      if (val) {
        const noChanges = tempArr.every(id => val.userManagers.includes(id));
        // controlar cuando no hay managers y llegan managers, o cundo había managers y ha habido cambios
        if ((tempArr.length === 0 && val.userManagers.length !== 0) || !noChanges) {
          this.userInfoForm.controls['managerId'].setValue(val.userManagers);
          this.userInfoForm.markAsDirty();
          this.formStatusDirty = true;
          this.userManagers = [...val.userManagers];
        }
        this.isDirtyEvent.emit(this.formStatusDirty);
        this.employeeUserInfo.managerId = val.userManagers; // Llegue lo que llegue siempre modificamos el origen??
        this.userManagersNames = val.managersNames;
      }
    });
  }

  getManagersNames(arr, obj) {
    arr.map(e => {
      const found = obj.find(m => m._id === e);
      if (found) this.userManagersNames[e] = found.personalData.name + ' ' + found.personalData.lastName;
    });
  }

  saveUserInfo() {
    const userInfo = this.userInfoForm.getRawValue();
    userInfo.managerId = this.userManagers; // To update user managers
    // console.log('to save', userInfo);
    // console.log('To Save', userInfo);
    return userInfo;
  }

  cancelEdit() {
    if (this.formStatusDirty) {
      // Launch confirmation modal si hay cambios
      const dialog = this.dialog.open(ChangesConfirmationModalComponent, {});
      dialog.afterClosed().subscribe(res => {
        if (res) {
          // restablecer los managers en cancelar
          this.employeeUserInfo.managerId = this.onCancelManagers;
          this.userInfoForm.controls['managerId'].setValue(this.onCancelManagers);
          this.isDirtyEvent.emit('close');
        }
      });
    } else this.isDirtyEvent.emit('close');
    this.isDirtyEvent.emit(this.formStatusDirty); // Como cerrar -> lanzamos modal confirmación si hay cambios sin guardar
  }

  deleteManager(manager) {
    this.employeeUserInfo.managerId = this.employeeUserInfo.managerId.filter(e => e !== manager);
    this.userManagers = this.employeeUserInfo.managerId;
    this.userInfoForm.controls['managerId'].setValue(this.userManagers);
    if (this.userManagersOriginalCopy !== JSON.stringify(this.userManagers)) {
      this.userInfoForm.markAsDirty();
      this.formStatusDirty = true;
      this.isDirtyEvent.emit(this.formStatusDirty);
    }
  }

  onChanges(): void {
    this.userInfoForm.valueChanges.subscribe(val => {
      if (JSON.stringify(this.formControlStatusInstance) !== JSON.stringify(val)) {
        // console.log('Form changed');
        this.formStatusDirty = true;
      } else {
        // console.log('Form not changed');
        this.formStatusDirty = false;
      }
      this.isDirtyEvent.emit(this.formStatusDirty);
    });
  }

}

export const passwordMatchValidator: ValidatorFn = (formGroup: FormGroup): ValidationErrors | null => {
  if (formGroup.get('password').value === formGroup.get('confirmPassword').value) return null;
  else return { passwordMismatch: true };
};

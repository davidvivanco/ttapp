import { Component, HostListener, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatTableDataSource } from '@angular/material';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DeleteConfirmationModalComponent } from 'src/app/shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { Employee } from 'src/app/shared/models/employee.model';
import { LogsMessagesAdmin } from 'src/app/shared/models/logsMessages.interface';
import { Unity } from 'src/app/shared/models/unity.model';
import { ApiService } from 'src/app/shared/services/api.service';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { UserService } from 'src/app/shared/services/user.service';
import { UnitiesModalComponent } from '../../components/modals/unities-modal/unities-modal.component';
import { UsersUnityModalComponent } from '../../components/modals/users-modal/users-modal.component';
import { UnitiesApiService } from '../../services/unities.api.service';
import { CanDeactivateState, ComponentCanDeactivate } from '../../../../shared/services/canDeactivate.guard';
import { tap } from 'rxjs/operators';

@Component({
  selector: 'app-unities-form',
  templateUrl: './unities-form.component.html',
  styleUrls: ['./unities-form.component.scss'],
})
export class UnitiesFormComponent implements OnInit, ComponentCanDeactivate {
  unityId: string;
  loading = false;
  loadingPage = false;
  newUnity: boolean;
  modifiedUnity = false;
  completeUnity: boolean;
  unity: Unity;
  unityForm: FormGroup;
  user: Employee;
  isEditable = true;
  children: any;
  users: any;
  unityDeleteParent = [];
  userDeleteUnity = [];

  dataSource = new MatTableDataSource<any>([]);

  tsLiterals: any;
  private logsMessagesKeys: Array<string>;
  private logsMessagesTranslations: LogsMessagesAdmin;

  constructor(
    private apiService: UnitiesApiService,
    private employeesApiService: ApiService,
    private logsService: LogsService,
    private translate: TranslateService,
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private router: Router,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    readonly matDialog: MatDialog,
  ) {
    this.user = this.userService.getUser();
    this.unityId = this.activatedRoute.snapshot.paramMap.get('unity');

    if (this.activatedRoute.snapshot.url[2].path === 'view') {
      this.isEditable = false;
    }

    this.translate.get('unitiesAdmin.tsLiterals').subscribe((translated: string) => {
      if (translated) this.tsLiterals = translated;
    });

    this.newUnity = true;
  }

  ngOnInit() {
    this.children = [];
    this.users = [];
    if (this.unityId) {             // EDIT
      this.loadingPage = true;
      this.getUnity(this.unityId);
      this.newUnity = false;
    } else {                        // NEW
      this.unity = new Unity();
      this.createFormUnity();
    }
  }

  handleError() {
    this.loading = false;
    this.logsService.logError(this.tsLiterals.toastError);
  }

  handleSuccess() {
    this.logsService.log(this.tsLiterals.toastSuccess);
  }

  getUnity(idUnity: string) {
    this.loading = true;
    return this.apiService.getUnity(idUnity).subscribe((unity: Unity) => {
      this.loading = false;
      this.loadingPage = false;
      this.unity = unity[0];
      this.createFormUnity(this.unity);
      this.getChildren();
      this.getUsers();
    }, this.handleError.bind(this));
  }

  getChildren() {
    this.unity.children.forEach(element => {
      this.apiService.getUnity(element).subscribe((child: Unity) => {
        this.children.push(child);
      });
    });
  }

  getUsers() {
    this.unity.users.forEach(element => {
      this.employeesApiService.getEmployeeForUnities(element).subscribe((user: Employee) => {
        this.users.push(user);
      });
    });
  }

  createFormUnity(unity?: Unity) {
    this.unityForm = this.formBuilder.group({
      name: [unity ? unity.name : '', [Validators.required]],
      desc: [unity ? unity.desc : '', [Validators.required]],
    });
    this.onChanges();
    this.checkCompleteUnity();
  }

  onChanges(): void {
    this.unityForm.valueChanges.subscribe(val => {
      this.modifiedUnity = true;
      this.checkCompleteUnity();
    });
  }

  checkCompleteUnity() {
    this.completeUnity = true;

    const formData = this.unityForm.value;
    for (const formElement of Object.values(formData)) {
      switch (typeof formElement) {
        case 'string':
          if (!formElement || formElement == null || formElement === '') {
            this.completeUnity = false;
          }
          break;
        case 'number':
          if (formElement == null || formElement < 0) {
            this.completeUnity = false;
          }
          break;
        case 'object':
          if (formElement == null) {
            this.completeUnity = false;
          }
          break;
      }
    }

    return;
  }

  saveUnity(callBack?: Function) {
    if (this.unityForm.valid) {
      this.loading = true;
      const formData = this.unityForm.value;
      this.unity.name = formData.name;
      this.unity.desc = formData.desc;

      this.unity.children = [];
      this.children.forEach(element => {
        this.unity.children.push(element._id);
      });

      this.unity.users = [];
      this.users.forEach(element => {
        this.unity.users.push(element._id);
      });

      if (this.newUnity) { // ADD
        this.apiService.createUnity(this.unity).subscribe((unity: Unity) => {
          this.unityId = unity._id;
          this.addMembers();
          this.deleteMembers();
          this.loading = false;
        }, this.handleError.bind(this));
      } else { // EDIT
        this.apiService.updateUnity(this.unityId, this.unity).subscribe((unity: Unity) => {
          this.addMembers();
          this.deleteMembers();
          this.loading = false;
        }, this.handleError.bind(this));
      }

      this.newUnity = false;
      this.modifiedUnity = false;
      if (!callBack) this.handleSuccess();
    } else {
      this.markAsTouched();
    }
  }

  addMembers() {
    this.children.forEach(element => {
      element.parentId = this.unityId;
      this.apiService.updateUnity(element._id, element).subscribe();
    });

    this.users.forEach(element => {
      element.unityId = this.unityId;
      this.employeesApiService.editUserInfo(element._id, element).subscribe();
    });
  }

  deleteMembers() {
    this.unityDeleteParent.forEach(element => {
      element[0].parentId = null;
      this.apiService.updateUnity(element[0]._id, element[0]).subscribe();
    });

    this.userDeleteUnity.forEach(element => {
      element[0].unityId = null;
      this.employeesApiService.editUserInfo(element[0]._id, element[0]).subscribe();
    });
  }

  markAsTouched() {
    Object.values(this.unityForm.controls).forEach((control: FormControl) => {
      control.markAsTouched();
    });
  }

  cancelUnity() {
    this.router.navigate(['/admin/unities']);
  }

  openChildrenModal() {
    this.dialog.open(UnitiesModalComponent, { width: '750px', data: { unityId: this.unityId }, autoFocus: false })
      .afterClosed().subscribe(res => {
        if (res) {
          res.forEach(element => {
            if (element.children.some(child => child === this.unityId)) {
              this.logsService.logError(this.tsLiterals.isParentPre + '\'' + element.name + '\'' + this.tsLiterals.isParentPost,);
            } else {
              if (!this.children.some(child => child._id === element._id)) {
                this.children.push(element);
                this.modifiedUnity = true;
              } else {
                this.logsService.logError(this.tsLiterals.repeatedChildren);
              }
            }
          });
        }
      });
  }

  openUserModal() {
    this.dialog.open(UsersUnityModalComponent, { width: '750px', data: {users: this.users}, autoFocus: false })
      .afterClosed().subscribe(res => {
        if (res) {
          res.forEach(element => {
            if (!this.users.some(user => user._id === element._id)) {
              this.users.push(element);
              this.modifiedUnity = true;
            } else {
              this.logsService.logError(this.tsLiterals.repeatedUsers);
            }
          });
        }
      });
  }

  unselectUnity(element) {
    const index = this.children.indexOf(element);
    const child = this.children.slice(index, index + 1);
    this.unityDeleteParent.push(child);
    this.children.splice(index, 1);
    this.modifiedUnity = true;
  }

  unselectUser(element) {
    const index = this.users.indexOf(element);
    const child = this.users.slice(index, index + 1);
    this.userDeleteUnity.push(child);
    this.users.splice(index, 1);
    this.modifiedUnity = true;
  }

  canDeactivate() {
    return !this.modifiedUnity;
  }
}

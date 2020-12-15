import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../../../../../shared/services/user.service';
import { Employee } from '../../../../../shared/models/employee.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../../../../shared/services/api.service';
import { MatDialog } from '@angular/material';
import { UploadAvatarModalComponent } from '../../../../../shared/components/shared/modals/upload-avatar-modal/upload-avatar-modal.component';
import { CommonFunctions } from 'src/app/commonFunctions';
import { EventService } from '../../../../../shared/services/event.service';
import { ConfigurationService } from '../../../../../shared/services/configuration.service';
import { CardPositionModalComponent } from '../../../../../card-position/card-position-modal/card-position-modal.component';
import { DeleteConfirmationModalComponent } from '../../../../../shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { AnalyticsService } from '../../../../../shared/services/shared-services/analytics.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-admin-candidates-personal-data',
  templateUrl: './admin-candidates-personal-data.component.html',
  styleUrls: ['./admin-candidates-personal-data.component.scss'],
})

export class AdminCandidatesPersonalDataComponent implements OnInit {
  private socket;

  permissions;
  loading = false;
  isEditMode = false;
  itsMe = true;
  personalDataForm: FormGroup;
  user: Employee;
  configuration: any;
  conf: any;
  gender: string;
  team: any;
  name: string;
  isMemberMyTeam = false;
  editPersonalData;

  // Desde configutacion de empresa
  @Input() public fromModal; // La estamos viendo desde una modal o en la vista de usuario?
  @Input() public employeePersonalData;
  @Input() public newEmployee;

  @Input('fromAdmin') public fromAdmin = false;
  @Input() public employeeFromAdmin;


  @Output() onSave = new EventEmitter();
  @Output() onBack = new EventEmitter();
  @Output() onCandidatures = new EventEmitter<Employee>();
  @Output() onCurriculum = new EventEmitter<Employee>();
  @Output() onPersonalData = new EventEmitter<Employee>();

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    private dialog: MatDialog,
    private commonFunctions: CommonFunctions,
    private eventService: EventService,
    private configurationService: ConfigurationService,
    private analyticsService: AnalyticsService,
    private translate: TranslateService
  ) {
  }

  ngOnInit() {
    this.permissions = this.userService.getPermissions();
    if (this.fromAdmin) {
      this.name = `${this.employeeFromAdmin.name} ${this.employeeFromAdmin.lastName}`;
      this.apiService.getOneEmployee(this.commonFunctions.fillUserId(this.employeeFromAdmin._id)).subscribe(res => {
        this.user = new Employee(res);
        this.createPersonalDataForm(this.user);
      });
    }

    this.analyticsService.addAnalytics({ accessTo: 'personalData', employee: this.user, userAgent: window.navigator.userAgent }).subscribe();
    this.configuration = this.configurationService.getConfiguration().personalData;
    this.conf = this.configurationService.getConfiguration();
    this.editPersonalData = this.configurationService.getConfiguration().company.editPersonalData;
  }

  toggleEditMode() {
    if (this.isEditMode) {
      const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: 'Guardar cambios', message: 'Esta acción no puede deshacerse' }, autoFocus: false });
      dialog.afterClosed().subscribe(res => {
        if (res) {
          this.modifyPersonalData();
          this.isEditMode = !this.isEditMode;
        } else {
          this.cancelEditForm();
        }
      });
    } else {
      this.isEditMode = !this.isEditMode;
    }
  }

  /* CANCELAR -> Revertir estado */
  cancelEditForm() {
    this.personalDataForm.reset(this.personalDataForm.value);
    this.personalDataForm.controls['id'].setValue(this.user.id);
    this.isEditMode = !this.isEditMode;
  }

  createPersonalDataForm(user: Employee) {
    const personalData = user.personalData;
    this.setGender(this.user.personalData.gender);
    const editable = this.configurationService.getConfiguration().company.editPersonalData;
    if (personalData.phones.professional.length < 1) personalData.phones.professional.push({ value: '', isMobile: false });
    if (personalData.phones.personal.length < 1) personalData.phones.personal.push({ value: '', isMobile: false });
    // Construimos form sin validators
    this.personalDataForm = this.formBuilder.group({
      id: [{ value: user.id, disabled: true }, []], // disabled, no modificable
      name: [personalData.name],
      lastName: [personalData.lastName],
      gender: [personalData.gender],
      email: this.formBuilder.group({
        personal: this.formBuilder.array(personalData.email.personal.map(e => this.createEmailFormArray(e, editable))),
        professional: this.formBuilder.array(personalData.email.professional.map(e => this.createEmailFormArray(e, editable))),
      }),
      birthday: [personalData.birthday, []],
      phones: this.formBuilder.group({
        personal: this.formBuilder.array(personalData.phones.personal.map(e => this.createPhonesFormArray(e, editable))),
        professional: this.formBuilder.array(personalData.phones.professional.map(e => this.createPhonesFormArray(e, editable))),
      }),
      address: this.formBuilder.group({
        street: [personalData.address.street, []],
        number: [personalData.address.number],
        province: [personalData.address.province, []],
        city: [personalData.address.city, []],
        country: [personalData.address.country, []],
        zipCode: [personalData.address.zipCode],
      })
    });

    if (editable) { // If editModule is active add Validators
      this.personalDataForm.get('name').setValidators([Validators.required]);
      this.personalDataForm.get('lastName').setValidators([Validators.required]);
      this.personalDataForm.get('gender').setValidators([Validators.required]);
      this.personalDataForm.get('address.number').setValidators([Validators.maxLength(4)]);
      this.personalDataForm.get('address.zipCode').setValidators([Validators.maxLength(5)]);
    }

  }

  modifyPersonalData(param?) {
    const personalData = this.personalDataForm.getRawValue();
    this.loading = true;
    this.apiService.modifyPersonalData(this.user.id, personalData).subscribe((res) => {
      if (this.itsMe) { // si soy yo
        this.user.personalData = res; // seteo user del componente
        this.userService.setUser(this.user); // seteo MI user global
        this.setGender(this.user.personalData.gender);
      }
      this.loading = false;
      this.onSave.emit(null);
    });
  }

  // create forma array
  createPhonesFormArray(e, editable) {
    const fb = this.formBuilder.group({
      value: [e.value],
      isMobile: [e.isMobile],
    });
    if (editable) fb.get('value').setValidators([Validators.pattern(new RegExp('[0-9 ]'))]);
    return fb;
  }

  createEmailFormArray(e, editable) {
    if (editable) return this.formBuilder.control(e, [Validators.email]);
    else return this.formBuilder.control(e);
  }

  uploadPhoto() {
    const dialogRef = this.dialog.open(UploadAvatarModalComponent, { autoFocus: false });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.apiService.uploadPhoto(result.file, this.user.id.toString()).subscribe(res => {
          this.user.personalData.photo = res.path;
          if (this.itsMe) {
            this.userService.setUser(this.user);
            this.eventService.changePhotoEmitter.emit({ ...this.user, ...res });
          }
        });
      }
    });
  }

  setGender(gender) {
    this.translate.get('personalData').subscribe(res => {
      if (res) {
        if (gender === 'm') this.gender = res.men;
        else if (gender === 'f') this.gender = res.women;
        else this.gender = res.other;
      }
    });
  }

  openCardPositionModal(cardPosition) {
    this.dialog.open(CardPositionModalComponent, { data: { cardPositionId: cardPosition.id, title: cardPosition.name } });
  }

  deletePhoto() {
    this.apiService.deletePhoto(this.user.id.toString()).subscribe(employee => {
      if (this.itsMe) {
        this.user.personalData.photo = '';
        this.userService.setUser(this.user);
        this.eventService.changePhotoEmitter.emit(this.user);
      }
    });
  }

  goBack = () => this.onBack.emit();

  goToCandidatures = () => this.onCandidatures.emit(this.employeeFromAdmin);

  goToCurriculum = () => this.onCurriculum.emit(this.employeeFromAdmin);

  goToPersonalData = () => this.onPersonalData.emit(this.employeeFromAdmin);
}



import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from '../shared/services/user.service';
import { Employee } from '../shared/models/employee.model';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { ApiService } from '../shared/services/api.service';
import { MatDialog } from '@angular/material';
import { UploadAvatarModalComponent } from '../shared/components/shared/modals/upload-avatar-modal/upload-avatar-modal.component';
import { CommonFunctions } from 'src/app/commonFunctions';
import { EventService } from '../shared/services/event.service';
import { ConfigurationService } from '../shared/services/configuration.service';
import { CardPositionModalComponent } from '../card-position/card-position-modal/card-position-modal.component';
import { DeleteConfirmationModalComponent } from '../shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { AnalyticsService } from '../shared/services/shared-services/analytics.service';
import { TranslateService } from '@ngx-translate/core';
import { FileUploader } from 'ng2-file-upload';
import { AuthInterceptor } from '../shared/services/authInterceptor';
import { UnitiesApiService } from '../admin/unities/services/unities.api.service';
import { ComponentCanDeactivate } from '../shared/services/canDeactivate.guard';

@Component({
  selector: 'app-personal-data',
  templateUrl: './personal-data.component.html',
  styleUrls: ['./personal-data.component.scss'],
})

export class PersonalDataComponent implements OnInit, ComponentCanDeactivate {
  private socket;

  permissions;
  loading = false;
  isEditMode = false;
  isModified = false;
  itsMe = true;
  personalDataForm: FormGroup;
  user: Employee;
  configuration: any;
  conf: any;
  gender: string;
  team: any;
  isMemberMyTeam = false;
  isModifyingPersonalInfo = false;
  personalInfo = {};
  uploader: FileUploader;
  extraDataPersonal;
  dataCollectionActivated;
  keysExtraData = [];
  schemaFields;
  schemaBlock;
  unity: any;
  employee: Employee;

  editPersonalData: boolean; // Desde configutacion de empresa
  @Input() public fromModal; // La estamos viendo desde una modal o en la vista de usuario?
  @Input() public employeePersonalData;
  @Input() public newEmployee;

  @Input('fromAdmin') public fromAdmin = false;
  @Input() public employeeFromAdmin;


  @Output() onSave = new EventEmitter();

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
    private translate: TranslateService,
    private unityApiService: UnitiesApiService
  ) {
  }

  ngOnInit() {
    this.permissions = this.userService.getPermissions();
    if (this.fromModal === 'addSingleUser') { // Create new user
      this.itsMe = false;
      this.isEditMode = true;
      this.user = this.newEmployee;
      this.createPersonalDataForm(this.user);
      // si llega el usuario por Input, pido el usuario a back y pinto sus datos.
    } else if (this.employeePersonalData) {
      this.apiService.getOneEmployee(this.employeePersonalData).subscribe(res => {
        this.user = new Employee(res);
        this.createPersonalDataForm(this.user);
        if (!this.isEditMode) this.setGender(this.user.personalData.gender);
      });

      this.apiService.getManagerTeam().subscribe(resu => { // ToDo -> isMemberMyTeam
        this.isMemberMyTeam = !!(resu.find(u => u.employeeId === this.employeePersonalData)); // Es de mi equipo? -> Refactor para usar una única función
      });

      const viewerId = this.userService.getUser().id;
      if (viewerId !== this.employeePersonalData) this.itsMe = false;

      if (this.fromModal && this.fromModal === 'editSingleUser') this.isEditMode = true;

    } else if (this.fromAdmin) {
      // console.log('vengo de admin');
      this.apiService.getOneEmployee(this.commonFunctions.fillUserId(this.employeeFromAdmin)).subscribe(res => {
        this.user = new Employee(res);
        this.createPersonalDataForm(this.user);
      });

    } else {
      // Evaluo si en esta pantalla soy yo, o estoy accediendo a los datos de otro usuario
      // si viuene el id de usuario por url pinto ese usuario ( esto es para poder visualizar, modificar o eliminar datos personales de otro usuario));
      this.route.params.subscribe(params => {
        if (params.employee) this.itsMe = false;
      });
      this.user = this.userService.getUser();
      if (this.itsMe) { // si soy yo, pinto mi personal Data
        this.createPersonalDataForm(this.user);
      } else {        // si no soy yo, evaluo que tenga permisos para verlo, recojo los datos del usuario por url y los pinto
        this.route.params.subscribe(params => {  // recojo el user de la url para pintar sus datos personales
          if (this.permissions.buscar_todos_personal_data) {
            this.apiService.getOneEmployee(this.commonFunctions.fillUserId(params.employee)).subscribe(res => {
              this.user = new Employee(res);
              this.createPersonalDataForm(this.user);
            });
          }
        });
      }
      if (!this.isEditMode) this.setGender(this.user.personalData.gender);

      if (this.user.unityId) {
        this.unityApiService.getUnity(this.user.unityId).subscribe(res => {
          this.unity = res;
        });
      }
    }

    this.analyticsService.addAnalytics({ accessTo: 'personalData', employee: this.user, userAgent: window.navigator.userAgent }).subscribe();
    this.configuration = this.configurationService.getConfiguration().personalData;
    this.conf = this.configurationService.getConfiguration();
    this.isEditablePersonalData();
    // console.log(this.permissions);

  }

  getSchemaPersonalData(user) {
    this.apiService.getSchemaPersonalData().subscribe((res: any) => {
      if (res && res.versions.length) {
        // última versión de personaldata
        if (this.isEditMode) {
          this.schemaFields = res.versions[res.versions.length - 1].blocks[0].fields;
        } else {
          this.schemaFields = res.versions[res.versions.length - 1].blocks[0].fields.filter(e => e.visibility); // Solo los visibles
        }
        this.schemaBlock = res.versions[res.versions.length - 1].blocks[0];
        this.schemaFields.forEach((element, i) => {
          this.personalDataForm.addControl(element.label, new FormControl('', []));
          this.keysExtraData.push(element.label);
        });
        if (user.personalData.extraData && user.personalData.extraData.block) {
          this.extraDataPersonal = user.personalData.extraData.block.fields;
          this.extraDataPersonal.forEach((element, i) => {
            if (this.personalDataForm.get(element.label) !== null) {
              this.personalDataForm.get(element.label).setValue(element.value);
            }
          });
        }
        this.personalInfo = this.personalDataForm.value;
      }
    });
  }

  toggleEditMode() {
    if (!this.isModifyingPersonalInfo) {
      this.personalInfo = this.personalDataForm.value;
      this.isModifyingPersonalInfo = true;
    }
    if (this.isEditMode) {
      const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: 'Guardar cambios', message: 'Esta acción no puede deshacerse' }, autoFocus: false });
      dialog.afterClosed().subscribe(res => {
        if (res) {
          this.modifyPersonalData();
          this.isEditMode = !this.isEditMode;
        } else this.cancelEditForm();
        this.isModifyingPersonalInfo = false;
      });
    } else {
      this.isEditMode = !this.isEditMode;
    }
  }

  /* CANCELAR -> Revertir estado */
  cancelEditForm() {
    this.personalDataForm.reset(this.personalInfo);
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
      // unityId: [(this.unity.name) ? { value: this.unity.name, disabled: true } : { value: null, disabled: true }, []],
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
    this.getSchemaPersonalData(user);

    if (editable) { // If editModule is active add Validators
      this.personalDataForm.get('name').setValidators([Validators.required]);
      this.personalDataForm.get('lastName').setValidators([Validators.required]);
      this.personalDataForm.get('gender').setValidators([Validators.required]);
      this.personalDataForm.get('address.number').setValidators([Validators.maxLength(4)]);
      this.personalDataForm.get('address.zipCode').setValidators([Validators.maxLength(5)]);
      if (personalData['extraData']) {
        personalData['extraData'] = this.user.personalData['extraData'];
        personalData['extraData'].block.fields.forEach((element, i) => {
          if (this.personalDataForm.get(element.label) !== null) {
            this.personalDataForm.get(element.label).setValidators([Validators.required]);
          }
        });
      }
    }
  }

  isEditablePersonalData() {
    // Esto lo necesitamos con la nueva configuracion???
    // const mainConf = this.configurationService.getConfiguration().company.editPersonalData;
    const userWatching = this.userService.getUser();
    const companyConf = this.configurationService.getConfiguration().company.appConfig;
    const userWatchingIsAdmin = (userWatching['rolesString'] && userWatching['rolesString'].indexOf('admin') !== -1);
    if (userWatchingIsAdmin) {
      this.editPersonalData = true; // Si soy admin
    } else if (this.itsMe && companyConf.userPersonalData === true) {
      this.editPersonalData = true; // Si soy yo + config -> true
    } else if (userWatching.isManager && companyConf.respPersonalData === true) {
      this.apiService.getOneEmployee(this.employeePersonalData).subscribe(res => {
        this.editPersonalData = res.managerId.includes(userWatching._id); // Si manager de este usuario + config -> true
      });
    } else if (companyConf.permPersonalData === true) {
      // Si tengo los permisos
      const editPerms = ['5d23ef11999444f8e9b1a119', '5d23713bbff2471aa0b4c284']; // 'name': 'actualizar_employees' y "name": "actualizar_personal_data",
      let userPerms = [].concat(...userWatching.roles.map((r) => r['permissions'])).map((p) => p['_id']);
      userPerms = userPerms.filter((item, index) => userPerms.indexOf(item) === index);
      const x = editPerms.some(p => userPerms.includes(p)); // Tengo los permisos??
      if (x) this.editPersonalData = true;
      else this.editPersonalData = false;
    } else this.editPersonalData = false;
  }

  modifyPersonalData(param?) {
    let personalData: any = Object.assign({}, this.personalDataForm.getRawValue());
    if (this.schemaBlock) { // datos extra
      const extraAux = {
        block: {
          blockId: this.schemaBlock._id,
          order: this.schemaBlock.order,
          name: this.schemaBlock.name,
          fields: this.schemaFields
        }
      };
      extraAux.block.fields.forEach(f => {
        f.fieldId = f._id;
        delete f._id;
        f.value = this.personalDataForm.get(f.label).value;
        delete personalData[f.label];
      });
      personalData.extraData = extraAux;
    }
    this.loading = true;
    this.apiService.modifyPersonalData(this.user.id, personalData).subscribe((res) => {
      if (this.itsMe) { // si soy yo
        this.user.personalData = res; // seteo user del componente
        this.userService.setUser(this.user); // seteo MI user global
        this.setGender(this.user.personalData.gender);
      }
      this.loading = false;
      this.onSave.emit(null);
      this.isModified = false;
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
    const userToken = this.userService.getToken();
    const requestHeaders = AuthInterceptor.getRequestHeaders(userToken);
    this.uploader = new FileUploader(
      {
        url: `${this.apiService.endpoint}/uploaderFiles/uploadMultipleFiles/${this.user.id.toString()}?path=${this.user.id.toString()}/avatar&privateFile=false`,
        queueLimit: 1,
        method: 'POST',
        headers: requestHeaders
      }
    );

    const dialogRef = this.dialog.open(UploadAvatarModalComponent, { autoFocus: false });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        let files = [result.file];
        this.uploader.addToQueue(files);
        this.uploader.uploadAll();
        this.uploader.onCompleteAll = () => {
          this.apiService.getPersonalData(this.user.id.toString()).subscribe(res => {
            let data = JSON.parse(JSON.stringify(res));
            this.user.personalData.photo = data.photo;
            if (this.itsMe) {
              this.userService.setUser(this.user);
              this.user = this.userService.getUser();
              this.eventService.changePhotoEmitter.emit({ ...this.user });
            }
          });
        };
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
      } else {
        this.user.personalData.photo = '';
        this.eventService.changePhotoEmitter.emit(this.user);

      }
    });
  }

  onChange() {
    this.isModified = true;
  }

  canDeactivate() {
    return !this.isModified;
  }
}



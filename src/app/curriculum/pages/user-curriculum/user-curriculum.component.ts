import { Component, OnInit, Input, ElementRef } from '@angular/core';
import { Block } from '../../classes/block';
import { CurriculumApiService } from '../../services/curriculum.api.service';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { DateAdapter } from '@angular/material/core';
import { Employee } from 'src/app/shared/models/employee.model';
import { UserService } from '../../../shared/services/user.service';
import { PersonalDataModalComponent } from 'src/app/personal-data/personal-data-modal/personal-data-modal.component';
import { ApiService } from '../../../shared/services/api.service';
import { Router, ActivatedRoute } from '@angular/router';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';

@Component({
  selector: 'app-user-curriculum',
  templateUrl: './user-curriculum.component.html',
  styleUrls: ['./user-curriculum.component.scss']
})
export class UserCurriculumComponent implements OnInit {

  user: Employee;
  blocks: Block[] = [];
  loading = false;
  block: Block;
  aux = {};
  noPublishedCV = false;
  editPersonalData: boolean;

  employeeId: string;
  objCV = {};
  firstLoad = true; // Saber si es la primera vez que cargamos o no para obtener los blocks de schema / forkjoin o no
  isMe = true;

  @Input('fromAdmin') public fromAdmin = false;
  @Input() public employeeFromAdmin;

  constructor(
    private api: CurriculumApiService,
    public dialog: MatDialog,
    private userService: UserService,
    private dateAdapter: DateAdapter<Date>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private elRef: ElementRef,
    private configurationService: ConfigurationService) {
    const lang = window.sessionStorage.getItem('lang');
    this.dateAdapter.setLocale(lang);
  }

  ngOnInit() {

    this.activatedRoute.params.subscribe(params => {
      if (params && params['employee']) {
        this.employeeId = params['employee'];
        this.isMe = false;
        this.objCV = {
          event: false,
          employeeId: this.employeeId
        };
        this.apiService.getOneEmployee(this.employeeId).subscribe((res) => {
          this.user = res;
        });
      } else this.user = this.userService.getUser();
    });

    if (this.fromAdmin) {
      this.isMe = false;
      this.objCV = {
        event: false,
        employeeId: this.employeeFromAdmin
      };
      this.apiService.getOneEmployee(this.employeeFromAdmin).subscribe((res) => {
        this.user = res;
      });
    }

    this.getCurriculum(this.objCV);
    this.editPersonalData = this.configurationService.getConfiguration().company.appConfig.userPersonalData;
  }

  getCurriculum(dataReceived: any) {
    if (dataReceived && dataReceived.event === false) this.firstLoad = true;
    this.loading = true;
    let query;
    if (this.firstLoad) {
      query = {
        blocks: this.api.getBlocksPublished(),
        values: this.api.getCurriculum(dataReceived.employeeId)
      };
      if (Object.keys(dataReceived).length === 0) {
        query.values = this.api.getCurriculum();
      } else {
        query.values = this.api.getCurriculum(dataReceived.employeeId);
      }

      forkJoin(query).pipe(
        finalize(() => { this.loading = false; })
      ).subscribe(
        (data: any) => {
          if (data.blocks.blocks && data.blocks.blocks.length) {
            this.noPublishedCV = false;
            this.blocks = data.blocks.blocks;
            this.firstLoad = false;
            if (data.values) {
              this.setValues(data.values.curriculum);
              // console.log("BLOQUES", this.blocks);
              this.block = this.blocks[0];
            } else {
              // console.warn('NO HAY VALORES AÑADIDOS!!!');
              // Lo gestiona cada hijo
            }
          } else {
            // console.log('NO HAY CV PUBLICADO');
            this.noPublishedCV = true;
          }
        },
        (err) => {
          if (err && err.error && err.error.message === 'There is no versions') {
            this.noPublishedCV = true;
          }
        }
      );
    } else {
      this.loading = true;
      let employee = '';
      if (dataReceived && dataReceived.employeeId) {
        employee = dataReceived.employeeId;
      }
      this.api.getCurriculum(employee).subscribe((data: any) => {
        this.loading = false;
        if (data.curriculum) this.setValues(data.curriculum);
      });
    }
  }

  setValues(values) {
    const blockAux = {};
    let item = {};
    values.map(v => {
      const block = this.blocks.find(b => b._id === v.blockId);
      if (block) {
        v.fields.map(fV => {
          const field = block.fields.find(fB => fB._id === fV.fieldId);
          if (field) {
            fV['type'] = field.type;
            fV['label'] = field.label;
          }
        });
        item = v;
        if (blockAux[block._id]) blockAux[block._id].push(item);
        else {
          blockAux[block._id] = [];
          blockAux[block._id].push(item);
        }
      }
    });
    // console.log('B_aux', blockAux); // -> Objeto a utilizar para pintar todos los items
    this.aux = blockAux;
  }

  openEditPersonalData(employee) {
    const dialog = this.dialog.open(PersonalDataModalComponent,
      { width: '800px',
        data: { employeeId: employee.id, fullName: `${employee.personalData.name} ${employee.personalData.lastName}`, modal: 'editSingleUser' } });
    dialog.afterClosed().subscribe((isSave) => {
      if (isSave) { // Reload USER
        this.api.getOneEmployee(this.user.id.toString()).subscribe(res => {
          this.user = new Employee(res);
        });
      }
    });
  }

  printCV() {
    let templateId: string;
    this.api.getCvTemplate(this.user.id.toString()).subscribe(res => {
      // console.log(res);
      const data = {
        name: 'CV',
        template: res
      };
      this.api.createPdfTemplate(this.user.id.toString(), data).subscribe(res2 => {
        templateId = res2.id;
        this.generatePdf(templateId);
      });
    });
  }

  generatePdf(templateId: string) {
    const data: any = {};
    this.api.generatePdf(this.user.id.toString(), templateId, data).subscribe((res) => {
      // It is necessary to create a new blob object with mime-type explicitly set
      // otherwise only Chrome works like it should
      const newBlob = new Blob([res], { type: 'application/pdf' });

      // IE doesn't allow using a blob object directly as link href
      // instead it is necessary to use msSaveOrOpenBlob
      if (window.navigator && window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveOrOpenBlob(newBlob);
        return;
      }

      // For other browsers:
      // Create a link pointing to the ObjectURL containing the blob.
      const dataBlob = window.URL.createObjectURL(newBlob);

      const link = document.createElement('a');
      link.href = dataBlob;
      link.download = `${this.user.id.toString()}-CV.pdf`;
      // this is necessary as link.click() does not work on the latest firefox
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      setTimeout(function () {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(dataBlob);
        link.remove();
      }, 100);
    });
  }
}

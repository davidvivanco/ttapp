import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Block } from '../../../../../curriculum/classes/block';
import { CurriculumApiService } from '../../../../../curriculum/services/curriculum.api.service';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material';
import { DateAdapter } from '@angular/material/core';
import { Employee } from 'src/app/shared/models/employee.model';
import { UserService } from '../../../../../shared/services/user.service';
import { PersonalDataModalComponent } from 'src/app/personal-data/personal-data-modal/personal-data-modal.component';

import { ApiService } from '../../../../../shared/services/api.service';

import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin-candidates-user-curriculum',
  templateUrl: './admin-candidates-user-curriculum.component.html',
  styleUrls: ['./admin-candidates-user-curriculum.component.scss']
})
export class AdminCandidatesUserCurriculumComponent implements OnInit {

  user: Employee;
  blocks: Block[] = [];
  loading = false;
  block: Block;
  aux = {};
  noPublishedCV = false;

  employeeId: string;
  objCV = {};
  firstLoad = true; // Saber si es la primera vez que cargamos o no para obtener los blocks de schema / forkjoin o no
  isMe = true;

  @Input('fromAdmin') public fromAdmin = false;
  @Input() public employeeFromAdmin;

  @Output() onBack = new EventEmitter();
  @Output() onCandidatures = new EventEmitter<Employee>();
  @Output() onCurriculum = new EventEmitter<Employee>();
  @Output() onPersonalData = new EventEmitter<Employee>();

  constructor(
    private api: CurriculumApiService,
    public dialog: MatDialog,
    private userService: UserService,
    private dateAdapter: DateAdapter<Date>,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService) {
    const lang = window.sessionStorage.getItem('lang');
    this.dateAdapter.setLocale(lang);
  }

  ngOnInit() {
    this.user = this.userService.getUser();
    this.activatedRoute.queryParams.subscribe(params => {
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
      }
    });

    if (this.fromAdmin) {
      this.isMe = false;
      this.objCV = {
        event: false,
        employeeId: this.employeeFromAdmin.id
      };
      this.apiService.getOneEmployee(this.employeeFromAdmin.id).subscribe((res) => {
        this.user = res;
      });
    }
    this.getCurriculum(this.objCV);

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
              this.block = this.blocks[0];
            }
          } else {
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
    const dialog = this.dialog.open(PersonalDataModalComponent, { data: { employeeId: employee.id, fullName: `${employee.personalData.name} ${employee.personalData.lastName}`, modal: 'editSingleUser' } });
    dialog.afterClosed().subscribe((isSave) => {
      if (isSave) { // Reload USER
        this.api.getOneEmployee(this.user.id.toString()).subscribe(res => {
          this.user = new Employee(res);
        });
      }
    });
  }


  goBack = () => this.onBack.emit();

  goToCandidatures = () => this.onCandidatures.emit(this.employeeFromAdmin);

  goToCurriculum = () => this.onCurriculum.emit(this.employeeFromAdmin);

  goToPersonalData = () => this.onPersonalData.emit(this.employeeFromAdmin);

}

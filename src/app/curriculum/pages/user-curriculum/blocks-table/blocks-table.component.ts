import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Block } from '../../../classes/block';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, DateAdapter } from '@angular/material';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { CurriculumApiService } from 'src/app/curriculum/services/curriculum.api.service';
import { AddComponentModalComponent } from '../add-component-modal/add-component-modal.component';
import { DeleteConfirmationModalComponent } from '../../../../shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { LogsMessagesBlocks, LogsMessagesCommon } from '../../../../shared/models/logsMessages.interface';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';
import { Employee } from '../../../../shared/models/employee.model';
import { UserService } from 'src/app/shared/services/user.service';
import { Roles } from '../../../../shared/models/roles.interface';

@Component({
  selector: 'app-blocks-table',
  templateUrl: './blocks-table.component.html',
  styleUrls: ['./blocks-table.component.scss']
})
export class BlocksTableComponent implements OnInit {

  user: Employee;
  block: Block;
  private translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private translations: LogsMessagesBlocks & LogsMessagesCommon;
  buttonDisabled: boolean;

  conf: any;

  @Input('block')
  set getValues(value: Block) {
    if (value) {
      this.block = value;
      this.noValuesAdded = false;
      this.setDataSource(value);
    } else {
      this.noValuesAdded = true;
      this.dataSource = new MatTableDataSource<any>(null);
    }
  }

  @Input() public isMe;
  @Input() public index;
  @Input() public blockSchema;
  @Input() public employeeId;

  @Output() getCurriculum = new EventEmitter();

  noValuesAdded = false;

  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['name', 'actions'];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private api: CurriculumApiService,
    public dialog: MatDialog,
    private dateAdapter: DateAdapter<Date>,
    private logsService: LogsService,
    private userService: UserService,
    private translate: TranslateService,
    private configurationService: ConfigurationService
  ) {
    this.dataSource = new MatTableDataSource<any>(null);
    this.conf = this.configurationService.getConfiguration();
    this.buttonDisabled = true;
  }

  ngOnInit() {
    this.translationsKeys = [
      'logsMessages.blocks.deleteBlock',
      'logsMessages.blocks.deleteBlockWarning',
      'logsMessages.blocks.deleteBlockSuccess',
      'logsMessages.common.errorOccurred',
    ]
    this.getTranslations();
    this.getPermisosEditCurriculum();
    // Obtenemos el block por input y escuchamos cambios en el padre del curriculum.
  }

  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesBlocks & LogsMessagesCommon) => {
        this.translations = translations
      });
  }

  getPermisosEditCurriculum() {
    this.user = this.userService.getUser();
    const roles: any = this.user.roles as unknown;
    let flagVar = false;

    if (this.user && this.conf.company.appConfig.userCurriculum) {
      this.buttonDisabled = true;
      flagVar = true;
    }

    if (this.conf.company.appConfig.respCurriculum) {
      this.buttonDisabled = true;
      flagVar = true;
    }

    const rolCurriculums = roles.find(rol => rol.name === 'curriculums_admin');
    if (rolCurriculums) {
      if (rolCurriculums.name === 'curriculums_admin' && this.conf.company.appConfig.permCurriculum) {
        this.buttonDisabled = true;
        flagVar = true;
      }
    }

    const rolAdmin = roles.find(rol => rol.name === 'admin');
    if (rolAdmin) {
      if (rolAdmin.name === 'admin') {
        this.buttonDisabled = true;
        flagVar = true;
      }
    }

    if (!flagVar) {
      if (!this.conf.company.appConfig.userCurriculum && !this.conf.company.appConfig.respCurriculum && !this.conf.company.appConfig.permCurriculum) {
        this.buttonDisabled = false;
      }
    }
  }

  checkRolCurriculums() {
    const roles: any = this.user.roles as unknown;
    return roles.find(rol => rol.name === 'curriculums_admin');
  }

  checkImAdmin() {
    const roles: any = this.user.roles as unknown;
    return roles.find(rol => rol.name === 'admin');
  }

  setDataSource(block?) {
    this.dataSource = new MatTableDataSource(block);
    setTimeout(() => this.dataSource.paginator = this.paginator);
    this.dataSource.sort = this.sort;
  }

  openModalAddComponent(blockSchema?: Block) {
    let employee = null;
    if (this.employeeId !== undefined) {
      employee = this.employeeId;
    }
    // Teniendo el schema en el padre ya no hace falta pedirlo antes de lanzar la modal
    const dialog = this.dialog.open(AddComponentModalComponent, { width: '700px', data: { block: blockSchema, employee: employee } });
    dialog.afterClosed().subscribe(res => {
      if (res) this.getCurriculum.emit({event: true, employeeId: employee});
    });

  }

  editElementFromBlock(dataReceived) {
    let employee = null;
    if (this.employeeId !== undefined) {
      employee = this.employeeId;
    }
    const dialog = this.dialog.open(AddComponentModalComponent, { width: '700px', data: { block: this.blockSchema, fillData: dataReceived, employee: employee}});
      dialog.afterClosed().subscribe(res => {
        if (res) this.getCurriculum.emit({event: true, employeeId: employee});
      });
  }

  deleteElementFromBlock(block: string, index) {
    let employee = null;
    if (this.employeeId !== undefined) {
      employee = this.employeeId;
    }
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, {
      data:
        {
          title: this.translations['logsMessages.blocks.deleteBlock'],
          message: this.translations['logsMessages.blocks.deleteBlockWarning']
        }
      });
      dialog.afterClosed().subscribe(accepts => {
        if (accepts) {
          this.api.deleteValueBlock(block, employee).subscribe(
            (res) => {
              if (res) {
                this.getCurriculum.emit({event: true, employeeId: employee});
                this.logsService.log(this.translations['logsMessages.blocks.deleteBlockSuccess']);
              }
            },
            () => this.handleError(this.translations['logsMessages.common.errorOccurred'])
          );
        }
      });
  }

  handleError(msg) {
    this.logsService.logError(msg);
  }

}

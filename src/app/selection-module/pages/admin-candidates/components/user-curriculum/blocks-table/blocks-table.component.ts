import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Block } from '../../../../../../curriculum/classes/block';
import { MatTableDataSource, MatPaginator, MatSort, MatDialog, DateAdapter } from '@angular/material';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { AddComponentModalComponent } from '../add-component-modal/add-component-modal.component';
import { LogsMessagesBlocks, LogsMessagesCommon } from '../../../../../../shared/models/logsMessages.interface';
import { TranslateService } from '@ngx-translate/core';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';
import { DeleteConfirmationModalComponent } from '../../../../../../shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { CurriculumApiService } from 'src/app/curriculum/services/curriculum.api.service';

@Component({
  selector: 'app-blocks-table',
  templateUrl: './blocks-table.component.html',
  styleUrls: ['./blocks-table.component.scss']
})
export class BlocksTableComponent implements OnInit {

  block: Block;
  private translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private translations: LogsMessagesBlocks & LogsMessagesCommon;

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

  @Input() public employeeFromAdmin;
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
    private translate: TranslateService,
    private configurationService: ConfigurationService
  ) {
    this.dataSource = new MatTableDataSource<any>(null);
    this.conf = this.configurationService.getConfiguration();
  }

  ngOnInit() {
    this.translationsKeys = [
      'logsMessages.blocks.deleteBlock',
      'logsMessages.blocks.deleteBlockWarning',
      'logsMessages.blocks.deleteBlockSuccess',
      'logsMessages.common.errorOccurred',
    ];
    this.getTranslations();
    // Obtenemos el block por input y escuchamos cambios en el padre del curriculum.
  }

  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesBlocks & LogsMessagesCommon) => {
        this.translations = translations;
      });
  }


  setDataSource(block?) {
    this.dataSource = new MatTableDataSource(block);
    setTimeout(() => this.dataSource.paginator = this.paginator);
    this.dataSource.sort = this.sort;
  }

  openModalAddComponent(blockSchema?: Block) {
    // Teniendo el schema en el padre ya no hace falta pedirlo antes de lanzar la modal
    const dialog = this.dialog.open(AddComponentModalComponent, { width: '700px', data: { block: blockSchema, employee: this.employeeFromAdmin.id } });
    dialog.afterClosed().subscribe(res => {
      if (res) this.getCurriculum.emit({ event: true, employeeId: this.employeeFromAdmin.id });
    });

  }

  editElementFromBlock(dataReceived) {
    const dialog = this.dialog.open(AddComponentModalComponent, { width: '700px', data: { block: this.blockSchema, fillData: dataReceived, employee: this.employeeFromAdmin.id}});
      dialog.afterClosed().subscribe(res => {
        if (res) this.getCurriculum.emit({event: true, employeeId: this.employeeFromAdmin.id});
      });
  }

  deleteElementFromBlock(block: string, index) {
    console.log('1', this.employeeFromAdmin.id);
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, {
      data:
        {
          title: this.translations['logsMessages.blocks.deleteBlock'],
          message: this.translations['logsMessages.blocks.deleteBlockWarning']
        }
      });
      dialog.afterClosed().subscribe(accepts => {
        if (accepts) {
          this.api.deleteValueBlock(block, this.employeeFromAdmin.id).subscribe(
            (res) => {
              if (res) {
                this.getCurriculum.emit({event: true, employeeId: this.employeeFromAdmin.id});
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

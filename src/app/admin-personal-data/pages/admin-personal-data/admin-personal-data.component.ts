import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatTableDataSource, MatPaginator, MatSort, MatSlideToggleChange } from '@angular/material';
import { AddFieldModalComponent } from './modal/add-field-modal/add-field-modal.component';
import { AdminPersonalDataApiService } from './../../services/admin-personal-data.api.service';
import { LogsMessagesCommon } from 'src/app/shared/models/logsMessages.interface';
import { TranslateService } from '@ngx-translate/core';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';
import { DeleteModalComponent } from './modal/delete-modal/delete-modal.component';


@Component({
  selector: 'app-admin-personal-data',
  templateUrl: './admin-personal-data.component.html',
  styleUrls: ['./admin-personal-data.component.scss']
})
export class AdminPersonalDataComponent implements OnInit {
  schemaPersonalData;
  dataSource = new MatTableDataSource<any>([]);
  blockId: string;
  loading = false;
  isChecked: boolean;
  isSchemaCreated = false;
  displayedColumns: string[] = ['field', 'actions'];
  labelsTitleArr = [];

  private logsMessagesKeys: Array<string>;
  private logsMessagesTranslations: LogsMessagesCommon;


  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(public dialog: MatDialog,
    public api: AdminPersonalDataApiService,
    private translate: TranslateService,
    private logsService: LogsService) {
    this.dataSource = new MatTableDataSource<any>(null);
    this.getSchema();
  }
  ngOnInit() {
    this.logsMessagesKeys = [
      'genericMessages.yes',
      'genericMessages.no',
      'adminPersonalData.clone',
      'logsMessages.personalData.cloneSuccess',
      'logsMessages.personalData.deleteSuccess',
      'logsMessages.personalData.publishSuccess',
      'logsMessages.personalData.cloneError',
      'logsMessages.personalData.deleteError',
      'logsMessages.personalData.publishError',
      'logsMessages.personalData.dataSlideError',
      'logsMessages.personalData.duplicateCloneTitleError'
    ];
    this.getLogsTranslations();
  }
  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: LogsMessagesCommon) => {
        this.logsMessagesTranslations = translations;
      });
  }
  onChange(value: MatSlideToggleChange) {
    setTimeout(() => this.isChecked = value.checked, 0);
    if (this.isSchemaCreated) {
      this.schemaPersonalData.dataCollectionActivated = this.isChecked;
      this.api.updateDataCollectionActivated(this.isChecked).subscribe(res => {
        if (res) {
          if (value.checked) {
            // something
          } else {
            // other thing
          }
        }
      }, err => {
        this.logsService.logError(this.logsMessagesTranslations['logsMessages.personalData.dataSlideError']);
      });
    }
  }

  applyFilter(filterValue: string) {
    if (this.dataSource) {
      this.dataSource.filter = filterValue.trim().toLowerCase();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  }

  addNewFieldModal() {
    const dialog = this.dialog.open(AddFieldModalComponent, {
      data: {
        isSchemaCreated: this.isSchemaCreated, schema: this.schemaPersonalData, fromCreate: true, titlesArr: this.labelsTitleArr
      }, autoFocus: false
    });
    dialog.afterClosed().subscribe(((res: string) => {
      if (res) {
        this.getSchema();
      }
    }));
  }

  getSchema() {
    this.loading = true;
    this.api.getSchema().subscribe((res: any) => {
      if (res !== null) {
        this.labelsTitleArr = [];
        // if res there is schema
        this.schemaPersonalData = res;
        this.isSchemaCreated = true;
        this.isChecked = res.dataCollectionActivated;
        if (this.schemaPersonalData.blocks.length > 0) {
          // only get data if there is data inside blocks
          this.setDataSource(res.blocks[0].fields);
          this.schemaPersonalData.blocks[0].fields.forEach(field => this.labelsTitleArr.push(field.label));
          this.blockId = res.blocks[0]._id;
        }
      }
      this.loading = false;
    });
  }

  setDataSource(data) {
    this.dataSource = new MatTableDataSource(data);
    setTimeout(() => this.dataSource.paginator = this.paginator);
    this.dataSource.sort = this.sort;
  }

  editElement(element, index) {
    let isSchemaCreated = false;
    if (this.schemaPersonalData != null) isSchemaCreated = true;
    const dialog = this.dialog.open(AddFieldModalComponent, {
      data: { isSchemaCreated: isSchemaCreated, schema: this.schemaPersonalData, elem: element, fromEdit: true, titlesArr: this.labelsTitleArr }, autoFocus: false
    });
    dialog.afterClosed().subscribe(data => {
      if (data) {
        this.getSchema();
      }
    });
  }

  deleteElement(element, index) {
    const dialog = this.dialog.open(DeleteModalComponent, {
      data: {
        title: `Eliminar ${element.label}`,
        message: '¿Desea eliminar este dato personal?'
      }
    });
    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.api.deleteField(element, this.blockId).subscribe((res) => {
          if (res) {
            this.getSchema();
            this.logsService.log(this.logsMessagesTranslations['logsMessages.personalData.deleteSuccess']);
          }
        });
      }
    }, err => {
      this.logsService.logError(this.logsMessagesTranslations['logsMessages.personalData.deleteError']);
    });
  }

  cloneElement(element, index) {
    const auxTitle = `${element.label} ${this.logsMessagesTranslations['adminPersonalData.clone']}`; // comprobar títulos repetidos
    if (this.labelsTitleArr.includes(auxTitle)) {
      this.logsService.logError(this.logsMessagesTranslations['logsMessages.personalData.duplicateCloneTitleError']);
    } else {
      const order = this.schemaPersonalData.blocks[0]['fields'].findIndex(elem => elem['_id'] === element._id);
      this.schemaPersonalData.blocks[0]['fields'].push(
        {
          label: `${this.schemaPersonalData.blocks[0]['fields'][order].label} ${this.logsMessagesTranslations['adminPersonalData.clone']}`,
          type: this.schemaPersonalData.blocks[0]['fields'][order].type,
          visibility: this.schemaPersonalData.blocks[0]['fields'][order].visibility
        });
      this.api.editBlockPersonalData(this.schemaPersonalData.blocks[0], this.schemaPersonalData.blocks[0]._id).subscribe(res => {
        if (res) {
          this.getSchema();
          this.logsService.log(this.logsMessagesTranslations['logsMessages.personalData.cloneSuccess']);
        }
      }, err => {
        this.logsService.logError(this.logsMessagesTranslations['logsMessages.personalData.cloneError']);
      });
    }
  }

  publish() {
    this.api.publish().subscribe(res => {
      if (res) {
        this.schemaPersonalData.status = 'active';
        this.logsService.log(this.logsMessagesTranslations['logsMessages.personalData.publishSuccess']);
      }
    }, err => {
      this.logsService.logError(this.logsMessagesTranslations['logsMessages.personalData.publishError']);
    });
  }
}

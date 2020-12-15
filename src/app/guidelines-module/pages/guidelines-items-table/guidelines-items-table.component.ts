import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ModalsComponent } from '../../modals/modals.component';
import { MOCKITEMSDATA } from './mockitemsdata';

@Component({
  selector: 'app-guidelines-items-table',
  templateUrl: './guidelines-items-table.component.html',
  styleUrls: ['../basic/guidelines.component.scss']
})
export class GuidelinesItemsTableComponent implements OnInit {

  table = `<div class="row">
  <div class="col-12">
    <mat-card class="card-dark-header">
      <mat-card-header>
        <mat-card-title>
          <mat-icon>speaker_notes</mat-icon>
        </mat-card-title>
        <p>Tabla usuarios / items</p>
      </mat-card-header>
      <div class="clearfix"></div>
      <mat-card-content>
        <div *ngIf="searchResultsView" class="mb-m">
          <div class="clearfix mt-sm"></div>
          <a [routerLink]="['/roles']" class="fake-button btn-sm btn-stroked-primary">
            <mat-icon>keyboard_arrow_left</mat-icon>Volver
          </a>
        </div>
        <div class="loading-table" *ngIf="loading">
          <mat-spinner></mat-spinner>
        </div>
        <mat-form-field>
          <mat-icon matPrefix>search</mat-icon>
          <input matInput [formControl]="globalFilter" placeholder="Filtrar elementos">
        </mat-form-field>
        <div *ngIf="dataSource.filteredData && dataSource.filteredData.length === 0 && !loading">
          <p class="description no-items">
            <mat-icon>error_outline</mat-icon>
            No hay elementos
          </p>
        </div>
        <table matSort mat-table [dataSource]="dataSource"
          *ngIf="dataSource.data !== null && dataSource.filteredData.length !== 0">
          <ng-container matColumnDef="name">
            <th mat-header-cell *matHeaderCellDef>Item</th>
            <td mat-cell *matCellDef="let element">
              <strong>{{element.name}}</strong><br>
              <span *ngIf="element.description" class="f-p">{{element.description}}</span>
            </td>
          </ng-container>
          <ng-container matColumnDef="actions">
            <th mat-header-cell *matHeaderCellDef></th>
            <td mat-cell *matCellDef="let element" class="text-right">
              <button mat-icon-button [matMenuTriggerFor]="menu" aria-label="Example icon-button with a menu">
                <mat-icon>more_vert</mat-icon>
              </button>
              <mat-menu #menu="matMenu">
                <button mat-menu-item (click)="editModal(element)">
                  <mat-icon>tune</mat-icon>
                  <span>Editar</span>
                </button>
                <button mat-menu-item (click)="deleteModal(element)">
                  <mat-icon>delete</mat-icon>
                  <span>Borrar</span>
                </button>
              </mat-menu>
            </td>
          </ng-container>
          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns; let i = index;"></tr>
        </table>
        <mat-paginator [pageSize]="10" showFirstLastButtons></mat-paginator>
      </mat-card-content>
      <div class="clearfix"></div>
    </mat-card>
  </div>
</div>`;

  loading = false;
  dataSource = new MatTableDataSource<any>([]);
  displayedColumns: string[] = ['name', 'actions'];
  searchResultsView = false;
  existingPositions = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  // Custom Filter Predicate
  globalFilter = new FormControl('');

  constructor(
    public dialog: MatDialog,
  ) {
    this.dataSource = new MatTableDataSource<any>(null);
  }

  ngOnInit() {
    this.globalFilter.valueChanges
      .subscribe(
        str => {
          str = str.trim().toLowerCase();
          this.dataSource.filter = str;
        }
      );
    this.loading = true;
    setTimeout(() => {
      this.dataSource = new MatTableDataSource<any>(MOCKITEMSDATA);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      this.loading = false;
    }, 3000);
  }

  tableFilter(): (data: any, filter: string) => boolean {
    const filterFunction = function (data, filter): boolean {
      const searchTerms = JSON.parse(JSON.stringify(filter));
      const ref = data.name + ' ' + data.description;
      // console.log(ref);
      return ref.toLowerCase().indexOf(searchTerms) !== -1;
    };
    return filterFunction;
  }

  actionModal() {
    const info = {
      title: 'Acción sobre tabla',
      description: 'Añadir 1 item. Carga masiva, etc...',
      actions: 'Guardar'
    };
    const dialogRef = this.dialog.open(ModalsComponent, {
      data: { info }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  editModal(item) {
    const info = {
      title: 'Modal editar',
      description: 'Cargar componente de edición item',
      actions: 'Guardar'
    };
    const dialogRef = this.dialog.open(ModalsComponent, {
      data: { info }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  deleteModal(item) {
    const info = {
      title: 'Modal borrar',
      description: 'Confirmación para borrar.',
      actions: 'Si'
    };
    const dialogRef = this.dialog.open(ModalsComponent, {
      data: { info }
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

}

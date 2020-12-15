import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatDialog } from '@angular/material';
import { MOCKDATA } from './mockdata';
import { ModalsComponent } from '../../modals/modals.component';

@Component({
    selector: 'app-guidelines-users-list',
    templateUrl: './guidelines-users-list.component.html',
    styleUrls: ['../basic/guidelines.component.scss']
})
export class GuidelinesUsersListComponent implements OnInit {

    noResults = true;
    loading = true;

    dataSource = new MatTableDataSource<any>([]);
    displayedColumns: string[] = ['photo', 'userInfo', 'actions'];
    @ViewChild(MatPaginator) paginator: MatPaginator;

    usersLists = `<div class="row">
  <div class="col-12 search-results-table">
      <mat-card>
          <mat-form-field *ngIf="dataSource.data && dataSource.data.length">
              <input matInput (keyup)="applyFilter($event.target.value)" placeholder="Filtrar resultados de búsqueda">
          </mat-form-field>
          <div class="col-12 mt-m" *ngIf="loading">
              <mat-spinner class="center"></mat-spinner>
          </div>
          <div *ngIf="noResults && !loading">
              <p class="description no-items">
                  <mat-icon>error_outline</mat-icon> No hay resultados de búsqueda
              </p>
          </div>
          <mat-card-content class="with-table search-results-table">
              <table mat-table [dataSource]="dataSource" class="users-table" *ngIf="dataSource.data !== null;">
                  <ng-container matColumnDef="photo">
                      <th mat-header-cell *matHeaderCellDef>
                          <!--Foto-->
                      </th>
                      <td mat-cell *matCellDef="let element" class="td-avatar">
                          <div class="avatar-sm">
                              <app-avatar [user]="element"></app-avatar>
                          </div>
                      </td>
                  </ng-container>
                  <ng-container matColumnDef="userInfo">
                      <th mat-header-cell *matHeaderCellDef>
                          <!--Nombre-->
                      </th>
                      <td mat-cell *matCellDef="let element" class="td-user-info">
                          <p class="title">
                              {{element.personalData.name}} {{element.personalData.lastName}}
                              <small *ngIf="element.dropDate" class="drop-date">Fecha de baja:
                                  {{element.dropDate |date:'mediumDate':'+0200':lang}}</small>
                          </p>
                          <p class="description text-sm mb-sm">
                              <mat-icon>person_pin</mat-icon>
                              <b>{{(element.cardPosition.name)? element.cardPosition.name : 'Sin ficha de puesto asignada'}}</b>
                          </p>
                          <a title="Ver datos personales" (click)="openPersonalEmployeeDataDetail(element)"
                              class="pointer">
                              <mat-icon>insert_drive_file</mat-icon>
                              <span>Datos personales </span>
                          </a>
                          <span class="ml-sm hide-md" *ngIf="element.cardPosition.name"></span>
                          <a *ngIf="element.cardPosition.name"
                              [routerLink]="['/organigrama', element.cardPosition.id]" routerLinkActive="active"
                              [routerLinkActiveOptions]="{ exact: true }" title="Ver organigrama">
                              <mat-icon>insert_drive_file</mat-icon>
                              <span>Ver organigrama</span>
                          </a>
                          <span class="ml-sm hide-md" *ngIf="element.cardPosition.name"></span>
                          <a title="Ver ficha de puesto" (click)="openCardPositionModal(element.cardPosition)"
                              class="pointer" *ngIf="element.cardPosition.name">
                              <mat-icon>insert_drive_file</mat-icon>
                              <span>Ficha de puesto</span>
                          </a>
                      </td>
                  </ng-container>
                  <ng-container matColumnDef="actions">
                      <th mat-header-cell *matHeaderCellDef>
                          <!-- ACTIONS -->
                      </th>
                      <td mat-cell *matCellDef="let element" class="td-actions">
                      </td>
                  </ng-container>
                  <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
              </table>
              <mat-paginator [pageSizeOptions]="[5, 10]" showFirstLastButtons [ngClass]="{'hide' : noResults}">
              </mat-paginator>
          </mat-card-content>
      </mat-card>
  </div>
</div>`;

    constructor(
        private dialog: MatDialog,
    ) {
        this.dataSource = new MatTableDataSource<any>(null); // Show the load spinner
    }

    ngOnInit() {
        setTimeout(() => {
            this.loading = false;
            this.noResults = false;
            this.dataSource = new MatTableDataSource<any>(MOCKDATA.documents);
            this.dataSource.paginator = this.paginator;
        }, 3000);
    }

    applyFilter(filterValue: string) {
        if (this.dataSource) {
            this.dataSource.filter = filterValue.trim().toLowerCase();
            if (this.dataSource.paginator) {
                this.dataSource.paginator.firstPage();
            }
        }
    }

    openPersonalDataModal(item) {
        console.log('Ver datos personales', item);
        const info = {
            title: 'Ver datos personales',
            description: 'Cargar componente datos personales. Editable solo por admin o propietario.',
            actions: 'Guardar'
        };
        const dialogRef = this.dialog.open(ModalsComponent, {
            data: { info }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
        });
    }

    openCardPositionModal(item) {
        console.log('Ver ficha', item);
        const info = {
            title: 'Ver ficha de puesto',
            description: 'Cargar componente de ficha de puesto. Editable solo por admin o propietario.',
            actions: 'Guardar'
        };
        const dialogRef = this.dialog.open(ModalsComponent, {
            data: { info }
        });

        dialogRef.afterClosed().subscribe(result => {
            console.log('The dialog was closed');
        });
    }

}

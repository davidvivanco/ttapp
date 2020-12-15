import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../shared/services/api.service';
import { Employee } from '../shared/models/employee.model';
import { UserService } from '../shared/services/user.service';
import { Observable } from 'rxjs';
import { CardPosition } from '../shared/models/card-position.model';
import { Permissions } from '../shared/models/permissions.model';
import { PersonalDataModalComponent } from '../personal-data/personal-data-modal/personal-data-modal.component';
import { MatDialog } from '@angular/material';
import { AnalyticsService } from '../shared/services/shared-services/analytics.service';

@Component({
  selector: 'app-card-position',
  templateUrl: './card-position.component.html',
  styleUrls: ['./card-position.component.scss']
})
export class CardPositionComponent implements OnInit {
  @Input() public cardPositionId;
  @Input() public fromModal; // La estamos viendo desde una modal o en la vista de usuario?

  public cardPosition$: Observable<CardPosition>;
  public permissions: Permissions;
  public employeesByCardPosition$: Observable<any>;
  public loading = true;
  private linesGoals = 10;
  cardPosition: CardPosition;
  // Necesitamos separar las competencias por agrupaciones
  competencesFiltered = {};

  public driverLicenses$: Observable<any>;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private userService: UserService,
    private dialog: MatDialog,
    private analyticsService: AnalyticsService) {
  }

  ngOnInit() {
    if (this.cardPositionId) {
      this.cardPosition$ = this.apiService.getOneCardPosition(this.cardPositionId);
      this.cardPosition$.subscribe((d: any) => {
        this.loading = false;
        if (!d) return;
        else this.cardPosition = d;
        this.linesGoals = Math.ceil(d.goals.length / 30);
        this.apiService.getEmployeesByCardPosition(d._id).subscribe(res => {
          this.employeesByCardPosition$ = res;
        });
        this.setCompetences(d.competences);
      });
    } else {
      this.permissions = this.userService.getPermissions();
      this.route.params.subscribe(params => {
        if (params['employee']) {
          this.cardPosition$ = this.apiService.getCardPositionByEmployee(params['employee']);
        } else {
          const employee = (this.userService.getUser() as Employee);
          if (employee.cardPositionId) {
            this.cardPosition$ = this.apiService.getOneCardPosition(employee.cardPositionId);
          }
        }
        if (this.cardPosition$) {
          this.cardPosition$.subscribe((d: any) => {
            this.loading = false;
            if (!d) return;
            else this.cardPosition = d;
            this.linesGoals = Math.ceil(d.goals.length / 30);
            this.apiService.getEmployeesByCardPosition(d._id).subscribe(res => {
              this.employeesByCardPosition$ = res;
            });
            this.setCompetences(d.competences);
          });
        } else {
          this.loading = false;
        }
      });
    }
    const userWatching = this.userService.getUser();
    this.analyticsService.addAnalytics({ accessTo: 'cardPosition', employee: userWatching, userAgent: window.navigator.userAgent }).subscribe();
    this.driverLicenses$ = this.apiService.getAllDriverLicenses();
  }

  printPositionCard() {
    this.apiService.printCardPosition(this.cardPosition.id).subscribe(res => {
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
      const data = window.URL.createObjectURL(newBlob);

      const link = document.createElement('a');
      link.href = data;
      link.download = `${this.cardPosition.name}.pdf`;
      // this is necessary as link.click() does not work on the latest firefox
      link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));
      setTimeout(function () {
        // For Firefox it is necessary to delay revoking the ObjectURL
        window.URL.revokeObjectURL(data);
        link.remove();
      }, 100);
    });
  }

  setCompetences(competences) {
    competences.map(c => {
      c.group = c.group[0].toUpperCase() + c.group.slice(1);
      if (!this.competencesFiltered[c.group]) {
        this.competencesFiltered[c.group] = [];
        this.competencesFiltered[c.group].push(c);
      } else this.competencesFiltered[c.group].push(c);
    });
  }

  openPersonalEmployeeDataDetail(employee) {
    this.dialog.open(PersonalDataModalComponent, { data: { employeeId: employee.id, fullName: employee.name + ' ' + employee.lastName, modal: 'viewCardPosition' } });
  }

}

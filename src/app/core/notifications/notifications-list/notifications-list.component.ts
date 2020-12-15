import { Component, OnInit, ViewChild } from '@angular/core';
import { ApiService } from '../../../shared/services/api.service';
import { Notification } from '../../../shared/models/notification.model';
import { EventService } from '../../../shared/services/event.service';
import { MatPaginator, MatTableDataSource } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-notifications-list',
  templateUrl: './notifications-list.component.html'
})
export class NotificationsListComponent implements OnInit {

  dataSource = new MatTableDataSource<Notification>([]);
  @ViewChild(MatPaginator) paginator: MatPaginator;
  displayedColumns: string[] = ['message', 'link', 'createdAt', 'buttonReaded', 'buttonDelete'];
  userHasNotifications: boolean;
  notificationsNotRead = 0;
  allNotifications: Notification[] = [];
  notReadTotal: number;
  messageTotalNotifications: string;

  constructor(
    private apiService: ApiService,
    private eventService: EventService,
    private translate: TranslateService,
    private router: Router) {
    eventService.notification.subscribe(() => {
      this.getNotifications();
    });
  }

  ngOnInit() {
    this.getNotifications();
  }

  getNotifications() {
    this.apiService.getNotifications().subscribe(res => {
      this.dataSource = new MatTableDataSource<Notification>(res);
      this.allNotifications = res;
      this.dataSource.paginator = this.paginator;
      this.hasNotifications(this.dataSource.filteredData);
      this.notReadTotal = this.checkUnreadNotifications(this.dataSource.filteredData);
      this.checkHowMuchNotificationsAreReaded(this.dataSource.filteredData);
      this.messageTotalNotifications = this.translate.instant('notifications.notificationsList.total', { total: this.dataSource.filteredData.length });
    });
  }

  hasNotifications(arr) {
    if (arr.length) this.userHasNotifications = true;
    else this.userHasNotifications = false;
  }

  checkUnreadNotifications(arr) {
    const filter = arr.filter(x => !x.isRead);
    if (filter.length) return filter.length;
    else return 0;
  }

  checkHowMuchNotificationsAreReaded = (notifications: Notification[]) => {
    notifications.forEach(e => {
      if (!e.isRead) this.notificationsNotRead++;
    });
  }

  markAsRead(notification: Notification) {
    this.apiService.markAsReadedNotification(notification._id).subscribe(() => {
      notification.isRead = true;
      this.eventService.notification.emit();
    });
  }

  markAllAsRead(arr) {
    arr.map(e => {
      if (!e.isRead) { this.markAsRead(e); }
    });
    event.stopPropagation();
  }

  delete(notification: Notification) {
    this.apiService.deleteNotification(notification._id).subscribe(() => {
      this.getNotifications();
    });
  }

  goToLink(notification: Notification, e) {
    e.preventDefault();
    this.markAsRead(notification);
    let queryParams;
    if (notification.params.length) {
      queryParams = this.buildQueryParams(notification.params);
    }
    this.router.navigate([notification.link], { queryParams: { ...queryParams } });
  }

  buildQueryParams(params) {
    let res = {};
    params.forEach(param => {
      res[param.name] = param.value;
    })

    return res;
  }

}

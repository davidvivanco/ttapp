import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../shared/services/api.service';
import { Notification } from '../../shared/models/notification.model';
import { EventService } from '../../shared/services/event.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-notifications',
    templateUrl: './notifications.component.html',
    styleUrls: ['./notifications.component.scss']
})
export class NotificationsComponent implements OnInit {

    notifications: Notification[] = [];
    notificationsNotRead = 0;
    allNotifications = [];
    maxNotifications = 5;

    constructor(
        private apiService: ApiService,
        private eventService: EventService,
        private router: Router,
    ) {
        eventService.notification.subscribe(() => {
            this.getNotifications();
        });
    }

    ngOnInit() {
    }

    getNotifications() {
        this.apiService.getNotifications().subscribe(res => {
            this.allNotifications = res;
            this.notifications = this.getMaxNotifications(res);
            this.notificationsNotRead = 0;
            this.checkHowMuchNotificationsAreReaded(res);
        });
    }

    getMaxNotifications = (notifications: Notification[]) => notifications.slice(0, this.maxNotifications);

    checkHowMuchNotificationsAreReaded = (notifications: Notification[]) => {
        notifications.forEach(e => {
            if (!e.isRead) this.notificationsNotRead++;
        });
    }
    markAsReaded(notification: Notification, event: Event) {
        this.apiService.markAsReadedNotification(notification._id).subscribe(() => {
            notification.isRead = true;
            this.eventService.notification.emit();
            this.updateViewNotRead();
        });
        event.stopPropagation();

    }

    markAllAsRead(arr) {
        arr.map(e => {
            if (!e.isRead) { this.markAsReaded(e, event); }
        });
        event.stopPropagation();
    }

    updateViewNotRead() {
        this.notificationsNotRead = this.notificationsNotRead - 1; // Update view of total in badge
        if (this.notificationsNotRead < 0) this.notificationsNotRead = 0;
    }

    deleteNotification(notification: Notification) {
        this.apiService.deleteNotification(notification._id).subscribe(() => {
            const index = this.notifications.findIndex(n => n._id === notification._id);
            this.notifications = this.removeDeletedNotification(index);
        });
    }

    removeDeletedNotification = (i: number) => this.notifications.slice(i, 1);

    goToLink(notification: Notification, e) {
        e.preventDefault();
        this.markAsReaded(notification, e);
        let queryParams
        if (notification.params.length) {
            queryParams = this.buildQueryParams(notification.params);
        }
        this.router.navigate([notification.link], { queryParams: { ...queryParams } });
    }

    buildQueryParams(params) {
        let res = {};
        params.forEach(param => {
            res[param.name] = param.value
        })

        return res;
    }
}

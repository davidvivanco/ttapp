import io from 'socket.io-client';
import { EventEmitter, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Employee } from '../models/employee.model';
import { UserService } from './user.service';
import { Subscription } from 'rxjs';
import { ConfigurationService } from './configuration.service';
import { configuration } from '../../../environments/companies/cappaz';
import { ConfigurationCompany } from '../models/configuration.model';

@Injectable()
export class EventService {

    public notification: EventEmitter<any> = new EventEmitter();
    public changePhotoEmitter: EventEmitter<Employee> = new EventEmitter();
    public changeLogosEmitter: EventEmitter<any> = new EventEmitter();
    public newCheckInOut: EventEmitter<Employee> = new EventEmitter();
    public newEmployee: EventEmitter<Employee> = new EventEmitter();
    public showModalEmbed: EventEmitter<any> = new EventEmitter();
    public menuEmitter: EventEmitter<any> = new EventEmitter();
    public oneMenuEmitter: EventEmitter<any> = new EventEmitter();
    public urlEmitter: EventEmitter<any> = new EventEmitter();
    public showMediaModal: EventEmitter<any> = new EventEmitter();
    public bottomLaunchModal: EventEmitter<any> = new EventEmitter();
    public bottomToggleMenu: EventEmitter<any> = new EventEmitter();
    private socket;
    private configuration: ConfigurationCompany;
    private subscriptions: Array<Subscription> = [];


    constructor(
        private userService: UserService,
        private configurationService: ConfigurationService
    ) {
        // Para evitar el fallo en produccion de los sockets
        this.configuration = this.configurationService.getConfiguration();
        if (this.configuration.services.notifications) {
            if (this.userService.getUser() && this.userService.getUser().id) this.connect();
            userService.userLoggedIn.subscribe((logged) => (logged) ? this.connect() : this.disconnect());
        }
    }

    async connect() {
        this.socket = io(environment.apiUrl, {
            transports: ['websocket']
        });
        const user = await this.userService.getUser();
        this.socket.emit('subscribe', user.id);

        // Listening events
        this.socket.on('notification', (data) => {
            this.notification.emit(data);
        });
    }

    disconnect() {
        this.socket.disconnect();
    }

    sendNotificationModalEmbed(notification) {
        this.showModalEmbed.emit(notification);
    }

    unSubscribeObservables() {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
    }

    setSubscription(subscription: Subscription) {
        this.subscriptions.push(subscription);
    }

}

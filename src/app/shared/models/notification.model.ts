export class Notification {
    _id: string;
    employee: string;
    message: string;
    link: string;
    isRead: boolean;
    createdAt: Date;
    params: Array<string>;
}

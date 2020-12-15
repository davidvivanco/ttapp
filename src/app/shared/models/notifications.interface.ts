export interface Notification {

    employee: string;
    isRead: boolean;
    link: string;
    message: string;
    params: [
        {
            positionId: string,
            name: string,
            value: string
        }
    ]
    type: string;
}
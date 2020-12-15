import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CanDeactivate } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { DeleteConfirmationModalComponent } from '../components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { LogsMessagesCommon } from '../models/logsMessages.interface';

export interface ComponentCanDeactivate {
    canDeactivate(): boolean | Observable<boolean>;
}

export const CanDeactivateState = {
    defendAgainstBrowserBackButton: false,
};

@Injectable({ providedIn: 'root' })
export class CanDeactivateGuard implements CanDeactivate<ComponentCanDeactivate> {
    private logsMessagesKeys: Array<string>;
    private logsMessagesTranslations: LogsMessagesCommon;

    constructor(
        readonly matDialog: MatDialog,
        private translate: TranslateService,
    ) {
        this.logsMessagesKeys = [
            'logsMessages.common.changesNoSaved',
            'logsMessages.common.getOutAnyway'
        ];
        this.getLogsTranslations();
    }

    getLogsTranslations(): void {
        this.translate.get(this.logsMessagesKeys)
            .subscribe((translations: LogsMessagesCommon) => {
                this.logsMessagesTranslations = translations;
            });
    }

    canDeactivate(component: ComponentCanDeactivate): boolean | Observable<boolean> {
        return component.canDeactivate() ||
            this.matDialog.open(DeleteConfirmationModalComponent, {
                data: {
                    title: this.logsMessagesTranslations['logsMessages.common.changesNoSaved'],
                    message: this.logsMessagesTranslations['logsMessages.common.getOutAnyway']
                }
            })
                .afterClosed()
                .pipe(
                    tap(confirmed => {
                        if (!confirmed && CanDeactivateState.defendAgainstBrowserBackButton) {
                            history.pushState(null, '', '');
                        }
                    })
                );
    }
}

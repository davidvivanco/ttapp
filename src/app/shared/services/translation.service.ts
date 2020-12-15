import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from './api.service';
import { DateAdapter } from '@angular/material';
import { ConfigurationService } from './configuration.service';

export interface ILocale {
    lang: string;
}

@Injectable()
export class TranslationService {
    private lang: string;
    public block: object;
    public spinnerActive: boolean;
    private conf: any;
    private enabledLangs: any[];

    constructor(
        private translate: TranslateService,
        private apiservice: ApiService,
        private dateAdapter: DateAdapter<Date>,
        public configurationService: ConfigurationService,
    ) {
        this.spinnerActive = true;
        this.conf = this.configurationService.getConfiguration();
        this.enabledLangs = this.setEnabledLangs(this.conf.services.translations.languages);
        this.lang = window.sessionStorage.getItem('lang') ? window.sessionStorage.getItem('lang') : 'es';
        if (!(this.enabledLangs.some(lang => lang === this.lang))) {
            this.lang = (window.sessionStorage.getItem('lang') === this.conf.services.translations.defaultLanguage) ?
                window.sessionStorage.getItem('lang') : this.conf.services.translations.defaultLanguage;
        }
        if (window.sessionStorage.getItem('lang') === null) window.sessionStorage.setItem('lang', this.lang); // Para poder usar en el resto de componentes
        this.translate.use(this.lang);
        this.dateAdapter.setLocale(this.lang);
    }

    /*
    public setLang() {
        this.translate.use('es');
    }
    */



    public loadTranslations(folder: string, block: string): void {
        this.spinnerActive = true;
        this.translate.get(block).subscribe(translation => {
            if (this.translationIsNotInMemory(translation, block)) {
                this.apiservice.getTranslation(folder, block, this.lang).subscribe(t => {
                    this.translate.setTranslation(t.lang, { [block]: t.data }, true);
                    this.translate.stream(block).subscribe(stream => {
                        this.translate.get(block).subscribe(translation2 => {
                            if (!this.translationIsNotInMemory(translation2, block)) {
                                this.spinnerActive = false;
                            }
                        });
                    });
                });
            } else this.spinnerActive = false;
        });
    }

    public loadTranslationsLoaderbyDefault(folder: string, block: string): void {
        this.spinnerActive = true;
        this.apiservice.getTranslationLoaderByDefault(folder, block, this.lang).subscribe(translation => {
            this.translate.setTranslation(this.lang, translation, true);
            this.translate.stream(block).subscribe(stream => {
                this.translate.get(block).subscribe(translation2 => {
                    if (!this.translationIsNotInMemory(translation2, block)) {
                        this.spinnerActive = false;
                    }
                });
            });

        });
    }

    public translationIsNotInMemory(translation: any, block: string): boolean {
        return (translation === block);
    }

    public getCurrentLang() { return this.lang; }

    public spinnerIsActive() {
        return this.spinnerActive;
    }

    private setEnabledLangs(obj) {
        const arr = [];
        for (const [key, value] of Object.entries(obj)) { if (value) arr.push(key); }
        return arr;
    }

}

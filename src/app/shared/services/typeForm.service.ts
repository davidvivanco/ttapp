import { Injectable } from '@angular/core';
import { CommonFunctions } from '../../commonFunctions';
import { UserService } from './user.service';
import * as typeformEmbed from '@typeform/embed'
import { TypeformOptions } from '../models/survey.model';


@Injectable()
export class TypeFormService {

    public options: TypeformOptions = {
        mode: 'drawer_left',
        autoOpen: true,
        autoClose: 0,
        hideScrollbars: true
    }

    constructor(
        private commonFunctions: CommonFunctions,
        private userService: UserService) {

    }


    openSurvey(
        url: string, options?: TypeformOptions, callback?: Function): void {
        if (options) this.options = { ...this.options, ...options };
        this.options.onSubmit = () => {
            callback();
        }

        typeformEmbed.makePopup(url, this.options);
    }

}

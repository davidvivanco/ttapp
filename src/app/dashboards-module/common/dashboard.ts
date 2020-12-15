import { Injectable } from '@angular/core';
import { Row, Col } from '../../shared/models/survey.model';
import { DomSanitizer } from '@angular/platform-browser';
import { UserService } from '../../shared/services/user.service';
import { Employee } from '../../shared/models/employee.model';
import { MatSelectChange } from '@angular/material';

@Injectable()

export class Dashboard {

    employee: Employee;
    _selects: Array<any>;

    constructor(
        public sanitizer: DomSanitizer,
        public userService: UserService
    ) {
        this.employee = userService.getUser();
    }

    dashboardMapper(row: Row) {
        for (const chart of row.cols) {
            chart.height = chart.height ? chart.height : 500;
            this.iframeUrlMapper(chart);
            chart.class = [chart.size, ...chart.select].join(' ');
        }
    }

    iframeUrlMapper(chart: Col) {
        if (Object.keys(chart).includes('filter') && chart.filter.length) {
            chart.mongoChartUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.appendFilterParam(chart));
        } else {
            chart.mongoChartUrl = this.sanitizer.bypassSecurityTrustResourceUrl(chart.mongoChartUrl);
        }
    }

    appendFilterParam(chart): string {
        let filterContainer = null;
        for (const filter of chart.filter) {
            if (filter.type === 'hiddenObjectId') {
                const userId = this.employee._id;
                if (!filterContainer) filterContainer = { [filter.fieldToQuery]: `***ObjectId('${userId}')***` }
                else filterContainer[filter.fieldToQuery] = `ObjectId("${userId}")`;
            }
        }

        return chart.mongoChartUrl + '&filter=' +
            encodeURIComponent(JSON.stringify(filterContainer)
                .replace('"***', '')
                .replace('***"', ''));

    }

    changeFilter(e: MatSelectChange, select: any) {
        let collection: HTMLCollection = document.getElementsByClassName(select.id);
        if (e.value) this.addFilter(collection, select, e);
        else this.removeFilter(collection, select, e);
    }

    removeFilter(collection: HTMLCollection, select: any, e: MatSelectChange) {
        for (let index = 0; index < collection.length; index++) {
            let src: string = collection[index].getAttribute('src');
            let filter: string = decodeURIComponent(src.split('filter=')[1]);
            if (src.indexOf('&filter=') > -1) { // si en src no existe parametro filter no hay que eliminar nada
                // el parametro filter se encuentra en src
                let mainSrc: string = decodeURIComponent(src.split('&filter=')[0]);
                let filterParsed: object = JSON.parse(filter);
                let keys: Array<string> = Object.keys(filterParsed);

                if (keys.includes(select.fieldToQuery)) { // si el src contiene el filtro lo elimino de la src
                    delete filterParsed[select.fieldToQuery];
                    let src2: string;
                    if (Object.keys(filterParsed).length > 0) {
                        src2 = mainSrc + '&filter=' + encodeURIComponent(JSON.stringify(filterParsed));
                    } else src2 = mainSrc;

                    collection[index].setAttribute('src', src2);
                }
            }
        }

    }


    addFilter(collection: HTMLCollection, select: any, e: MatSelectChange) {
        for (let index = 0; index < collection.length; index++) {

            let src: string = collection[index].getAttribute('src');
            if (src.indexOf('filter=') < 0) {// src no tiene todavía el parametro filter
                const newSrc: string = src + '&filter=' + encodeURIComponent(JSON.stringify({ [select.fieldToQuery]: e.value }));
                collection[index].setAttribute('src', newSrc);
            } else { // src ta tiene el parametro filter

                let filter: string = decodeURIComponent(src.split('filter=')[1]);
                let mainSrc: string = src.split('&filter=')[0];
                let filterParsed: object = JSON.parse(filter);
                let keys = Object.keys(filterParsed);

                if (keys.length === 1) { // src solo contiene un filtro
                    const filters = Array.from(new Set([
                        keys[0],
                        select.fieldToQuery.trim()]));

                    if (filters.length === 1) { // el filtro existente es el mismo que quiero setear... lo sustituyo
                        const src2 = mainSrc + '&filter=' + encodeURIComponent(JSON.stringify({ [select.fieldToQuery]: e.value }));
                        collection[index].setAttribute('src', src2);
                    } else { // el filtro existente no es el mismo que quiero setear... lo añado
                        filterParsed[select.fieldToQuery] = e.value;
                        const src3 = mainSrc + '&filter=' + encodeURIComponent(JSON.stringify(filterParsed));
                        collection[index].setAttribute('src', src3);
                    }
                } else { // hay mas de un filtro existente en la url
                    if (keys.includes(select.fieldToQuery)) {// en los filtros existentes se encuentra el filtro que quiero setear --- lo sustituyo
                        delete filterParsed[select.fieldToQuery];
                        filterParsed[select.fieldToQuery] = e.value;
                        const src4: string = mainSrc + '&filter=' + encodeURIComponent(JSON.stringify(filterParsed));
                        collection[index].setAttribute('src', src4);

                    } else { // en los filtros existentes NO se encuentra el filtro que quiero setear --- lo añado
                        filterParsed[select.fieldToQuery] = e.value;
                        const src5: string = mainSrc + '&filter=' + encodeURIComponent(JSON.stringify(filterParsed));
                        collection[index].setAttribute('src', src5);
                    }
                }
            }
        }

    }
}

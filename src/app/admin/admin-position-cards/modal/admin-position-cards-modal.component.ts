import { Component, OnInit, Inject, ViewChild } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';

import { ApiService } from '../../../shared/services/api.service';
import { LogsService } from 'src/app/shared/services/shared-services/logs.service';

import { DeleteConfirmationModalComponent } from '../../../shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';
import { CardPosition } from 'src/app/shared/models/card-position.model';
import { Observable } from 'rxjs';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';
import { TranslateService } from '@ngx-translate/core';
import { LogsMessagesCommon } from '../../../shared/models/logsMessages.interface';

// Modal para editar la ficha de puesto
@Component({
  templateUrl: './admin-position-cards-modal.component.html',
  styleUrls: ['./admin-position-cards-modal.component.scss']
})
export class AdminPositionCardsModalComponent implements OnInit {

  config: any;

  card: CardPosition;
  cardPositionsForm: FormGroup;
  availableCompetences: any;
  availableKpis: any;
  resultsFilterKpis: any;
  availableReportTo: any;
  availableDriverLicenses = {};
  hideContent = false;
  showTitleError = false;
  languagesList: any[];
  computerKnowledgesList: any[];
  computerKnowledgesTypes = ['other', 'office', 'word', 'excel'];
  availableComputerKnowledges = [];
  public reportTo$: Observable<any>;
  public selectedReport: any;
  workData: any;

  @ViewChild('positionSelect') positionSelect;
  public availablePositions: any[];
  public isAvailablePositionsLoaded: Promise<boolean>;
  cardPositionsMatChips = {};
  private logsMessagesKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private logsMessagesTranslations: LogsMessagesCommon; // Para delete mat chips sin afectar al padre hasta que guarde

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private formBuilder: FormBuilder,
    private apiService: ApiService,
    public dialogRef: MatDialogRef<AdminPositionCardsModalComponent>,
    private matDialog: MatDialog,
    private logsService: LogsService,
    private translate: TranslateService,
    public configurationService: ConfigurationService) {
    dialogRef.disableClose = true;
  }

  ngOnInit() {
    this.logsMessagesKeys = [
      'logsMessages.common.elementExists',
      'logsMessages.common.changesNoSaved',
      'logsMessages.common.close?'
    ];
    this.getLogsTranslations();
    this.config = this.configurationService.getConfiguration(); // Para saber carnets disponibles si ficha es nueva

    this.apiService.getAllDriverLicenses().subscribe(res => {
      res.map(dl => {
        this.availableDriverLicenses[dl.value] = dl.text;
      });
      let driverLicenses = this.data.item.driverLicenses;
      if (!driverLicenses) { // Si la ficha es nueva!!!
        driverLicenses = {};
        // const avDriverLicenses = Object.keys(this.availableDriverLicenses);
        const avDriverLicenses = this.config.cardPosition.carnetsAvailable;
        avDriverLicenses.push('other');
        avDriverLicenses.map(e => driverLicenses[e] = false);
      }
      this.card = new CardPosition(JSON.parse(JSON.stringify(this.data.item)), driverLicenses);
      for (const key in this.card.languages) {
        this.card.languagesList.push(this.card.languages[key]); // Creo que esto no hace falta
      }

      this.languagesList = Object.keys(this.card.languages); // Manejo paralelo de objetos para mostrar ocultar matChips
      this.computerKnowledgesList = Object.keys(this.card.educations.computerKnowledges); // Manejo paralelo de objetos para mostrar ocultar matChips
      this.checkAvailableComputerKnowledges(this.computerKnowledgesList);
      // Report to
      if (this.card.report) {
        this.apiService.getOneCardPosition(this.card.report.id).subscribe(d => {
          this.selectedReport = d.id;
        });
      }

      this.createFormCardPositions(this.card);

      this.apiService.getAllCardPositions(0, 9999).subscribe(res2 => {
        this.reportTo$ = res2;
        this.availableReportTo = this.excludeCurrentCardPosition(this.card, res2.documents);
      });

      this.apiService.getAvailablePositions().subscribe(d => {
        this.availablePositions = d;
        this.isAvailablePositionsLoaded = Promise.resolve(true);
        if (this.card.positions) {
          this.availablePositions = this.availablePositions.concat(this.card.positions);
          this.setSelects(this.availablePositions, this.card.positions);
        }
      });

      this.apiService.getAllCompetences().subscribe(d => {
        this.availableCompetences = d;
        if (this.card.competences) this.setSelects(this.availableCompetences, this.card.competences);
      });

      this.apiService.getAllKpis().subscribe(d => {
        this.availableKpis = d;
      });
    });
  }

  getLogsTranslations(): void {
    this.translate.get(this.logsMessagesKeys)
      .subscribe((translations: LogsMessagesCommon) => {
        this.logsMessagesTranslations = translations;
      });
  }

  createFormCardPositions(card: CardPosition) {

    this.cardPositionsForm = this.formBuilder.group({ // para hacerlos editables simplemente quitar el parametro disabled
      name: [card.name, []],
      goals: [card.goals, []],
      department: [card.department, []],
      area: [card.area, []],
      addressDirection: [card.addressDirection, []],
      workCenter: [card.workCenter, []],
      hasEmployees: [card.hasEmployees, []],
      workdayType: [card.workdayType, []],
      report: [card.report.id, []],
      category: [card.category, []],
      tasks: [card.tasks, []],
      competences: [card.competences, []],
      kpis: [card.kpis, []],
      positions: [card.positions, []],
      driverLicenses: this.formBuilder.group({}),
      educations: this.formBuilder.group({
        computerKnowledges: [card.educations.computerKnowledges, []],
        studies: [card.educations.studies, []],
        other: [card.educations.other, []],
      }),
      languages: [card.languages, []],
      languagesList: [card.languagesList, []],
      other: this.formBuilder.group({
        highlights: [card.other.highlights, []],
        other: [card.other.other, []],
        sectorExperience: [card.other.sectorExperience, []],
      })
    });


    // Add dynamic driverLicenses
    let driverLicenses = this.cardPositionsForm.get('driverLicenses') as FormGroup;
    for (const key in this.availableDriverLicenses) {
      driverLicenses.addControl(key, new FormControl(card.driverLicenses[key]));
    }

    if (this.card.id) {
      this.cardPositionsForm.addControl('id', new FormControl({ value: this.card.id, disabled: true }, []));
    }

    // si el usuario no tiene permisos de edición, pongo a disabled el form y oculto el boton de editar
    if (!this.data.permissions || !this.data.permissions.crear_card_position || !this.data.permissions.actualizar_card_position || this.data.action === 'ver') {
      this.cardPositionsForm.disable({ onlySelf: true });
    }

  }

  setSelects(availableArr, selectedArr) {
    // Al inicio para ocultar las opciones ya seleccionadas
    selectedArr.map(e => {
      const f = availableArr.find(x => x._id === e._id);
      if (f) f.hide = true;
    });
    availableArr = this.sortAlphabetical(availableArr, 'name');
  }

  checkAvailableComputerKnowledges(arr) {
    this.availableComputerKnowledges = this.computerKnowledgesTypes.filter(x => !arr.includes(x));
  }

  saveNewChip(item, who, type, input?, availableOptions?) {
    let tempCard = this.getWhere(who);
    // console.log(item, who, type, tempCard);
    if (type === 'array') {
      if (availableOptions) { // Si usamos un array de disponibles tienen que tener _id -> item es la id en este caso
        const found = availableOptions.find(x => x._id === item);
        item = found;
        // UPDATE SELECT
        availableOptions.forEach((p): any => {
          if (p._id === item._id) p.hide = true;
        });
        tempCard.push(item);
      } else {
        // Check si elemento existe en la lista
        const found = tempCard.find(x => x === item);
        if (found) this.logsService.logError(this.logsMessagesTranslations['logsMessages.common.elementExists']);
        else tempCard.push(item);
      }
    } else {
      if (tempCard[item.key] === item.value) this.logsService.logError(this.logsMessagesTranslations['logsMessages.common.elementExists']);
      else {
        tempCard[item.key] = item.value;
        if (who === 'languages') {
          this.languagesList.push(item.key);
        } else if (who === 'educations.computerKnowledges') {
          this.computerKnowledgesList.push(item.key);
          this.checkAvailableComputerKnowledges(this.computerKnowledgesList);
        }
      }
    }
    if (input && input.length) input.map(inp => inp.value = '');
    this.cardPositionsForm.markAsDirty();
  }

  deleteMatChip(item, who, type, options?) {
    const tempCard = this.getWhere(who);
    if (type === 'array') {
      const index = tempCard.findIndex(x => x === item);
      if (index >= 0) tempCard.splice(index, 1);
      if (options) {
        // UPDATE SELECT
        options.forEach((p: any) => {
          if (p._id === item._id) p.hide = false;
        });
      }
    } else {
      delete tempCard[item.key];
      if (who === 'languages') {
        const index = this.languagesList.findIndex(x => x === item.key);
        if (index >= 0) this.languagesList.splice(0, 1);
      } else if (who === 'educations.computerKnowledges') {
        const index = this.computerKnowledgesList.findIndex(x => x === item.key);
        if (index >= 0) this.computerKnowledgesList.splice(index, 1);
        this.checkAvailableComputerKnowledges(this.computerKnowledgesList);
      }
    }
    this.cardPositionsForm.markAsDirty();
  }

  getWhere(who) { // Add or Delete Matchips -> para saber donde editamos
    const str = who.split('.');
    const l = str.length;
    if (l > 1) return this.card[str[0]][str[1]]; // Para cuando lo que buscamos está en el segundo nivel
    else return this.card[str[0]];
  }

  savePositionCard() {
    if (this.cardPositionsForm.get('name').value !== '') {
      // console.log('Send to parent', this.cardPositionsForm.getRawValue().educations.computerKnowledges);
      this.dialogRef.close(this.cardPositionsForm.getRawValue());
    } else {
      this.showTitleError = true;
    }
  }

  close(isDirty) {
    if (isDirty) {
      this.hideContent = true;
      this.matDialog.open(DeleteConfirmationModalComponent, { data: { title: this.logsMessagesTranslations['logsMessages.common.changesNoSaved'],
      message: this.logsMessagesTranslations['logsMessages.common.closeAnyway'] } }).afterClosed().subscribe(res => {
        if (res) this.dialogRef.close();
        else this.hideContent = false;
      });
    } else {
      this.dialogRef.close();
    }
  }

  /*
    Busca el valor recibido en una lista
  */
  findKpis(value, array) {
    this.resultsFilterKpis = [];
    if (value !== '') {
      for (let index = 0; index < this.availableKpis.length; index++) {
        if (this.availableKpis[index] !== undefined && this.availableKpis[index].toLowerCase().indexOf(value.toLowerCase()) !== -1) {
          this.resultsFilterKpis.push(this.availableKpis[index]);
        }
      }
    }
  }

  /*
    Rellena el input con el valor recibido, y borra el array que se recibe por parámetro (usado autocompletar)
  */
  fillInput(value, input, arrayToEmpty) {
    input.map(inp => inp.value = value);
    arrayToEmpty.map(array => array.length = 0);
  }

  orderDriverLicenses = (a, b) => {
    return a.key > b.key ? -1 : 1;
  }

  excludeCurrentCardPosition(currentCard, availableCards) {
    availableCards = availableCards.filter(x => x.name !== currentCard.name);
    availableCards = this.sortAlphabetical(availableCards, 'name');
    return availableCards;
  }

  sortAlphabetical(arr, key) {
    arr.sort((a, b) => {
      if (a[key] < b[key]) return -1;
      if (a[key] > b[key]) return 1;
      return 0;
    });
    return arr;
  }

}

import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/app/shared/services/api.service';
import { UserService } from '../../../../../shared/services/user.service';
import { Employee } from '../../../../../shared/models/employee.model';

interface PositionsAvailable {
  _id: string;
  id: string;
  selected: boolean;
  disabled: boolean;
  code: string;
  description: string;
  name: string;
}

@Component({
  selector: 'add-subscription',
  templateUrl: 'add-subscription.component.html'
})
export class AddSubscriptionComponent implements OnInit {

  positions: Array<PositionsAvailable>;
  user: Employee;
  distinctPositions: Array<string>;
  selects: any;
  positionSelected: PositionsAvailable;
  translations;
  selectElementManually;
  translationsKeys: Array<string>;
  title = '';
  displayedColumns = ['name', 'actions'];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<AddSubscriptionComponent>,
    private translate: TranslateService,
    private apiService: ApiService,
    private userService: UserService
  ) {
    this.user = this.userService.getUser();
  }

  getPositions() {
    this.apiService.getAllPositions().subscribe(positions => {
      // filtro las que tiene el usuario ya subscritas.
      this.positions = positions.filter(p => !this.distinctPositions.includes(p._id));
      if (this.data.subscription) {
        // edit mode
        const positionToEdit = this.data.subscription.searchParameters.position;
        this.positions.forEach(p => p.disabled = true);
        this.positions.unshift(positionToEdit);
        this.positions[0].selected = true;
        this.positions[0].disabled = true;
        this.selectElementManually = {
          checking: true,
          element: positionToEdit,
        };
      }
    });
  }

  ngOnInit() {
    this.distinctPositions = this.data.subscriptions.pagination.map(sub => sub.searchParameters.position._id);
    this.getPositions();
    this.translationsKeys = [
      'selection.subscriptions.modal.titleAdd'
    ];
    this.getTranslations();
    this.title = this.translations['selection.subscriptions.modal.titleAdd'];
  }

  generateSelectTypeSubscriptionData() {
    this.selects = [
      {
        title: 'Elige tipo de oferta',
      }
    ];

    if (this.data.subscription) {
      this.selects[0].valueSelected = this.data.subscription.searchParameters.offerType;

    }

    if (this.user.externalUser) {
      this.selects[0].options = [
        {
          label: 'Pública',
          value: 'public'
        },
        {
          label: 'Bolsa de trabajo',
          value: 'job'
        }
      ]
    } else {
      this.selects[0].options = [
        {
          label: 'Privada',
          value: 'private'
        }, {
          label: 'Pública',
          value: 'public'
        },
        {
          label: 'Movilidad',
          value: 'mobility'
        }
      ];

    }
  }

  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations) => {
        this.translations = translations;
        this.generateSelectTypeSubscriptionData();
      });
  }

  submit(position) {
    this.positionSelected = position._id;
    this.close(false);
  }

  close(canceling?: boolean): void {
    this.dialogRef.close({ canceling, position: this.positionSelected, type: this.selects[0].valueSelected });
  }

  cancel() {
    this.close(true);
  }
}
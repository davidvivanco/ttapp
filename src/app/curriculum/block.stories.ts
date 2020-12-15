

import {BlockCardComponent} from './components/block-card/block-card.component';
import { moduleMetadata } from '@storybook/angular';
import { action } from '@storybook/addon-actions';
import {CurriculumModule} from './curriculum.module';
import { BlockComponent } from './components/block/block.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {FieldModalComponent} from './components/field-modal/field-modal.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

class DialogMock {
  close(...args) {
    return action('close')(...args);
  }
}

export default {
  title: 'Curriculum/Block',
  decorators: [
    moduleMetadata({
      imports: [
        CurriculumModule,
        BrowserAnimationsModule
      ],
      providers: [
        {provide: MatDialogRef, useClass: DialogMock},
        {provide: MAT_DIALOG_DATA, useClass: () => {}}
      ]
    })
  ]
};

export const BlockCard = () => ({
  component: BlockCardComponent,
  props: {
    title: 'Aqui va el titulo'
  },
  template: `
    <app-block-card [title]="title">
      Here is the content
    </app-block-card>
  `
});

export const Block = () => ({
  component: BlockComponent,
  props: {
    save: action('Save'),
    cancel: action('Cancel')
  }
});

export const BlockWithData = () => ({
  component: BlockComponent,
  props: {
    onSave: action('Save'),
    onCancel: action('Cancel'),
    fields: [
      {label: 'Nombre', type: 'text', validation: {required: true, visible: false}},
      {label: 'Titulo', type: 'header'},
      {label: 'Categorias', type: 'decisionTree'},
      {label: 'Select', type: 'select', options: [{label: 'A'}]},
    ],
    label: 'Mi bloque'
  }
});

export const FieldModal = () => ({
  component: FieldModalComponent,
  props: {

  }
});

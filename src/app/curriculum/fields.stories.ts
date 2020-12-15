import { moduleMetadata } from '@storybook/angular';
import { FormGroup, FormControl, FormArray } from '@angular/forms';
import {OptionsFieldComponent} from './components/options-field/options-field.component';
import {DateRangeComponent} from './components/date-range/date-range.component';
import {DecisionTreeInputComponent} from './components/decision-tree-input/decision-tree-input.component';
import {NestedMenuComponent} from './components/nested-menu/nested-menu.component';
import {CurriculumModule} from './curriculum.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export default {
  title: 'Curriculum/Fields',
  decorators: [
    moduleMetadata({
      imports: [
        CurriculumModule,
        BrowserAnimationsModule
      ],
    }),
  ],
};

const optionsProp = [
  {label: '1', value: '1'},
  {label: '2', value: '2'},
  {label: '3', value: '3'},
  {label: '4', value: '4'}
];

export const select = () => ({
  component: OptionsFieldComponent,
  props: {
    formGroup: new FormGroup({
      label: new FormControl('')
    })
  },
  template: `
    <app-select-field></app-select-field>
  `
});

export const selectLabel = () => ({
  component: OptionsFieldComponent,
  props: {
    formGroup: new FormGroup({
      label: new FormControl('')
    })
  },
  template: `
    <app-select-field labelLabel="Nombre" optionsLabel="Opciones" optionKeyLabel="Clave" optionValueLabel="Valor"></app-select-field>
  `
});

export const singleOptions = () => ({
  component: OptionsFieldComponent,
  props: {
    options: optionsProp,
    single: true
  }
});

export const options = () => ({
  component: OptionsFieldComponent,
  props: {
    options: optionsProp,
    label: 'Opciones'
  }
});


export const decisionTree = () => ({
  component: OptionsFieldComponent,
  props: {
    formArray: new FormArray([])
  },
  template: `
    <app-decision-tree-field [formArray]="formArray"></app-decision-tree-field>
  `
});

export const dateRange = () => ({
  component: DateRangeComponent,
  props: {
    
  }
});

export const DecisionTreeInput = () => ({
  component: DecisionTreeInputComponent,
  props: {
    
  }
});

export const DecisionTreeOutput = () => ({
  component: NestedMenuComponent,
  props: {
    field: new FormGroup({
      label: new FormControl('Click en estudios'),
      value: new FormControl(['hey']),
      tree: new FormControl([
        {label: 'Medicina', tree: [
          {label: 'Pediatria'}
        ]},
        {label: 'Ingenieria'},
        {label: 'Biologia'},
        {label: 'Química', tree: [
          {label: "Quimica Organica", tree: [
            {label: 'Curso Carbono 101'}
          ]}
        ]},
      ])
    })
  },
  template: `
    <div [formGroup]="field">
      <button mat-button [matMenuTriggerFor]="menu.childMenu">{{field.get('label').value}}</button>
      <app-nested-menu formControlName="value" #menu [tree]="field.get('tree').value"></app-nested-menu>
      <div>{{field.get('value').value}}</div>
    </div>
  `
});


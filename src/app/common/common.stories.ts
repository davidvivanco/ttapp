

import { moduleMetadata } from '@storybook/angular';
import {CommonModule} from './common.module';
import {PageTemplateComponent} from './components/page-template/page-template.component';

export default {
  title: 'Common',
  decorators: [
    moduleMetadata({
      imports: [
        CommonModule
      ]
    })
  ]
};

export const pageTemplate = () => ({
  component: PageTemplateComponent,
  props: {
    breadcrumb: ['Bloque', 'id'],
    addButton: 'Añadir',
    loading: true
  }
})

export const pageTemplate2 = () => ({
  component: PageTemplateComponent,
  props: {
    breadcrumb: ['Bloque'],
    loading: false
  }
})
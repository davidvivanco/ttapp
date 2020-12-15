import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GuidelinesComponent } from './pages/basic/guidelines.component';
import { GuidelinesButtonsComponent } from './pages/buttons/buttons.component';
import { GuidelinesColumnsGridComponent } from './pages/guidelines-columns-grid/guidelines-columns-grid.component';
import { GuidelinesUsersListComponent } from './pages/guidelines-users-list/guidelines-users-list.component';
import { GuidelinesItemsTableComponent } from './pages/guidelines-items-table/guidelines-items-table.component';
import { GuidelinesModalsComponent } from './pages/guidelines-modals/guidelines-modals.component';
import { CardsComponent } from './pages/cards/cards.component';
import { GuidelinesUxComponent } from './pages/guidelines-ux/guidelines-ux.component';
import { TreeComponent } from './pages/tree/tree.component';
import { ListsComponent } from './pages/lists/lists.component';
import { FormsComponent } from './pages/forms/forms.component';
import { LoadfilesComponent } from './pages/loadfiles/loadfiles.component';
import { BasicComponentComponent } from './pages/basic-component/basic-component.component';
import { GuideLinesMatChipsComponent } from './pages/guide-lines-mat-chips/guide-lines-mat-chips.component';
import { GuidelinesIconsComponent } from './pages/guidelines-icons/guidelines-icons.component';
import { GuidelinesParentChildComponent } from './pages/guidelines-parent-child/guidelines-parent-child.component';
import { GuidelinesColorsComponent } from './pages/guidelines-colors/guidelines-colors.component';
import { SelectionComponent } from './pages/selection/selection.component';
import { SchemasComponent } from './pages/schemas/schemas.component';

const routes: Routes = [
  { path: 'basic', component: GuidelinesComponent},
  { path: 'basicComponent-UX', component: BasicComponentComponent},
  { path: 'buttons', component: GuidelinesButtonsComponent},
  { path: 'mat-chips', component: GuideLinesMatChipsComponent},
  { path: 'icons', component: GuidelinesIconsComponent},
  { path: 'comunicacion-padres-hijos', component: GuidelinesParentChildComponent},
  { path: 'columns', component: GuidelinesColumnsGridComponent},
  { path: 'colors', component: GuidelinesColorsComponent},
  { path: 'usersLists', component: GuidelinesUsersListComponent},
  { path: 'itemsTables', component: GuidelinesItemsTableComponent},
  { path: 'modals', component: GuidelinesModalsComponent},
  { path: 'cards', component: CardsComponent},
  { path: 'ux', component: GuidelinesUxComponent},
  { path: 'tree', component: TreeComponent},
  { path: 'lists', component: ListsComponent},
  { path: 'forms', component: FormsComponent},
  { path: 'loadfiles', component: LoadfilesComponent},
  { path: 'selection', component: SelectionComponent},
  { path: 'schemas', component: SchemasComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],

exports: [RouterModule]
})
export class GuidelinesRoutingModule { }

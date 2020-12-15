import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {EditCurriculumComponent} from './pages/edit-curriculum/edit-curriculum.component';
import {UserCurriculumComponent} from './pages/user-curriculum/user-curriculum.component';
import {EditBlockComponent} from './pages/edit-block/edit-block.component';
import { CanDeactivateGuard } from '../shared/services/canDeactivate.guard';

const routes: Routes = [
  {path: '',  component: UserCurriculumComponent },
  {path: ':employee',  component: UserCurriculumComponent },
  {path: 'admin/blocks', component: EditCurriculumComponent},
  {path: 'admin/blocks/add', component: EditBlockComponent, canDeactivate: [CanDeactivateGuard]},
  {path: 'admin/blocks/:id', component: EditBlockComponent, canDeactivate: [CanDeactivateGuard]}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { GlobalComponent } from './pages/global/global.component';
import { SurveysComponent } from './pages/surveys/surveys.component';
import { MoodComponent } from './pages/mood/mood.component';

const routes: Routes = [
  { path: '', component: SurveysComponent },
  { path: 'cuestionarios', component: SurveysComponent },
  { path: 'estados-animo', component: MoodComponent },
  { path: 'global', component: GlobalComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class DashboardsRoutingModule { }
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CheckinoutComponent } from './pages/checkinout/checkinout.component';
import { ManageCheckInOutComponent } from './pages/manage-check-in-out/manage-check-in-out.component';
import { ManageCheckInOutCompanyComponent } from './pages/manage-check-in-out-company/manage-check-in-out-company.component';

const routes: Routes = [
    { path: '', component: CheckinoutComponent },
    // AuthGuard - CanActivate -> está en el app.routing con el module. Los hijos heredan
    { path: 'mis-fichajes', component: CheckinoutComponent },
    { path: 'manager/fichajes-equipo', component: ManageCheckInOutComponent },
    { path: 'admin/fichajes-empresa', component: ManageCheckInOutCompanyComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class CheckInOutRoutingModule { }

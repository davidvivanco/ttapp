import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminPersonalDataComponent } from './pages/admin-personal-data/admin-personal-data.component';



const routes: Routes = [
	{path: '', component: AdminPersonalDataComponent}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class AppRoutingModule { }

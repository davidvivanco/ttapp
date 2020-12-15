import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListOffersComponent } from './pages/offers/list-offers/list-offers.component';
import { AddOfferComponent } from './pages/offers/add-offer/add-offer.component';
import { ListAnnouncementsComponent } from './pages/announcements/list-announcements/list-announcements.component';
import { AddAnnouncementComponent } from './pages/announcements/add-announcement/add-announcement.component';
import { PrivateListAnnouncementsComponent } from './pages/private-list-announcements/private-list-announcements.component';
import { ListOffersAnnouncement } from './pages/list-offers-announcement/list-offers-announcement.component';
import { NominationsComponent } from './pages/nominations/nominations.component';
import { SubscriptionsComponent } from './pages/subscriptions/subscriptions.component';

import { ListRequirementsComponent } from './pages/list-requirements/list-requirements.component';
import { AddRequirementCriterionComponent } from './pages/add-requirementCriterion/add-requirementCriterion.component';
import { AddRequirementComponent } from './pages/add-requirement/add-requirement.component';

import { AdminCandidatesComponent } from './pages/admin-candidates/admin-candidates.component';
import { CanDeactivateGuard } from '../shared/services/canDeactivate.guard';
import { AddRequirementCriterionValorationComponent } from './pages/add-requirementCriterionValoration/add-requirement-criterion-valoration.component';



const routes: Routes = [
  // { path: '', component: OfferComponent },
  { path: 'admin/ofertas', component: ListOffersComponent },
  { path: 'admin/ofertas/add', component: AddOfferComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'admin/ofertas/edit/:id', component: AddOfferComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'admin/convocatorias', component: ListAnnouncementsComponent },
  { path: 'admin/convocatorias/edit/:id', component: AddAnnouncementComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'admin/convocatorias/add', component: AddAnnouncementComponent, canDeactivate: [CanDeactivateGuard] },
  { path: 'convocatorias-internas', component: PrivateListAnnouncementsComponent },
  { path: 'convocatorias-internas/ofertas/:id', component: ListOffersAnnouncement },
  { path: 'admin/candidaturas', component: AdminCandidatesComponent },
  { path: 'ofertas', component: ListOffersAnnouncement },
  { path: 'candidaturas', component: NominationsComponent },
  { path: 'suscripciones', component: SubscriptionsComponent },
  // Baremaciones
  { path: 'admin/baremaciones', component: ListRequirementsComponent },
  { path: 'admin/baremaciones/:requirementId', component: AddRequirementComponent },
  { path: 'admin/baremaciones/:requirementId/:criterionId', component: AddRequirementCriterionComponent },
  { path: 'admin/baremaciones/:requirementId/:criterionId/add', component: AddRequirementCriterionValorationComponent },
  { path: 'admin/baremaciones/:requirementId/:criterionId/edit', component: AddRequirementCriterionValorationComponent }
  // AuthGuard - CanActivate -> está en el app.routing con el module. Los hijos heredan
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})

export class SelectionRoutingModule { }

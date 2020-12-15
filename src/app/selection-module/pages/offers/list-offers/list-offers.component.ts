import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { SelectionApiService } from '../../../services/selection.api.services';
import { Announcement } from '../../../../shared/models/announcement.model';


@Component({
  selector: 'app-list-offers',
  templateUrl: './list-offers.component.html'
})
export class ListOffersComponent implements OnInit, OnDestroy {
  announcementId: string;
  offersId: Array<string>;
  showView: boolean;
  event;
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: SelectionApiService) {

    this.event = router.events.subscribe((val) => {
      if (val instanceof NavigationEnd) {
        this.offersId = [];
      }
    });

  }
  ngOnDestroy(): void {
    this.event.unsubscribe();
  }

  ngOnInit() {

    this.route.queryParams.subscribe(params => {
      if (params.announcementId) {
        this.announcementId = params.announcementId;
        this.api.getAnnouncementById(this.announcementId).subscribe((res: { announcement: Announcement }) => {
          if (res.announcement.offers) this.offersId = res.announcement.offers.map(offer => offer._id);
          this.showView = true;
        });
      } else this.showView = true;
    });
  }

  addOffer() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

}

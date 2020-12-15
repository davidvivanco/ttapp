import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { SelectionApiService } from '../../../services/selection.api.services';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-list-announcements',
  templateUrl: './list-announcements.component.html',
  styleUrls: ['./list-announcements.component.scss']
})
export class ListAnnouncementsComponent implements OnInit {
  tsLiterals: any;

  constructor(private router: Router,
    private route: ActivatedRoute, private api: SelectionApiService, private translate: TranslateService) {
    this.translate.get('selectionAdmin.announcements.list.tsLiterals').subscribe((translated: string) => {
      if (translated) this.tsLiterals = translated;
    });
  }

  ngOnInit() {

  }

  addAnnouncement() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }
}

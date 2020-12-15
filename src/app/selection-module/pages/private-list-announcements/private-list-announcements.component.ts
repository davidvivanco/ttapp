import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { SelectionApiService } from '../../services/selection.api.services';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-private-list-announcements',
  templateUrl: './private-list-announcements.component.html',
  styleUrls: ['./private-list-announcements.component.scss']
})
export class PrivateListAnnouncementsComponent implements OnInit {
  tsLiterals: any;

  constructor(private router: Router,
    private route: ActivatedRoute, private api: SelectionApiService, private translate: TranslateService) {
    this.translate.get('selectionAdmin.announcements.list.tsLiterals').subscribe((translated: string) => {
      if (translated) this.tsLiterals = translated;
    });
  }

  ngOnInit() {

  }


}

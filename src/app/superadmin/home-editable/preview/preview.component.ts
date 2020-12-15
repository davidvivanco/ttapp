import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';

import { ConfigurationService } from '../../../shared/services/configuration.service';

import { ConfigurationCompany } from 'src/app/shared/models/configuration.model';

@Component({
  selector: 'app-preview',
  templateUrl: './preview.component.html',
  styleUrls: ['./preview.component.scss']
})
export class PreviewComponent implements OnInit {

  conf: ConfigurationCompany;

  constructor(
    private location: Location,
    public configurationService: ConfigurationService) { }

  ngOnInit() {
    this.conf = this.configurationService.getConfiguration();
  }

  backClicked() {
    this.location.back();
  }
}

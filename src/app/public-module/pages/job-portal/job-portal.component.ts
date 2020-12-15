import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ConfigurationCompany } from 'src/app/shared/models/configuration.model';
import { ConfigurationService } from 'src/app/shared/services/configuration.service';
import { ModalLoginComponent } from './modals/modal-login/modal-login.component';
import { ModalRegisterComponent } from './modals/modal-register/modal-register.component';

@Component({
  selector: 'app-job-portal',
  templateUrl: './job-portal.component.html',
  styleUrls: ['./job-portal.component.scss']
})
export class JobPortalComponent implements OnInit {

  conf: any;

  public environment: ConfigurationCompany;
  constructor(
    public configurationService: ConfigurationService,
    public dialog: MatDialog
  ) { }

  ngOnInit() {
    this.conf = this.configurationService.getConfiguration();
  }

  openLoginModal() {
    this.dialog.open(ModalLoginComponent);
  }

  openRegisterModal() {
    this.dialog.open(ModalRegisterComponent, {
      width: '400px'
    });
  }
}

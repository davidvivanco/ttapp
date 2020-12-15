import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ConfigurationCompany } from 'src/app/shared/models/configuration.model';
import { PublicApiService } from '../../services/public.api.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html'
})
export class RegisterComponent implements OnInit {
  public registerForm: FormGroup;
  public environment: ConfigurationCompany;
  public loggedUrl: string;
  public hide = true;

  constructor(
    private formBuilder: FormBuilder,
    private publicApiService: PublicApiService
  ) { }

  ngOnInit() {

  }

}

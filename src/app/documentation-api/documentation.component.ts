import { Component, OnInit } from '@angular/core';
import { AnalyticsService } from '../shared/services/shared-services/analytics.service';
import { environment } from '../../environments/environment';
import { BodyExample } from '../shared/types/bodyExample';
import { Employee } from '../shared/models/employee.model';
import { UserService } from '../shared/services/user.service';
@Component({
  selector: 'app-documentation',
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.scss']
})
export class DocumentationComponent implements OnInit {
  environment = environment;
  bodyExamples: BodyExample;
  bodyExamplesEmployees: string;
  bodyExamplesPositions: string;
  user: Employee;
  constructor(
    private analyticsService: AnalyticsService,
    private userService: UserService
  ) {
    this.user = this.userService.getUser();
    this.bodyExamplesPositions = `  [
          {
            "name": "insert by push",
            "description": "insert by push",
            "id": "XDALS23",
            "code": "hhhh333"
          },
          {
            "name": "insert by push",
            "description": "insert by push",
            "id": "EGF6767",
            "code": "xxxx333"
          }
    ]`;
    this.bodyExamplesEmployees = `[
      {
         "id": "rdelrio",
         "roles": [
             "5d1dab6c06424c0dacf9f3fb",
             "5d1e14ba5490a8e199d7071f",
             "5d1e159c5490a8e199d70720"
         ],
         "managerId": "5d1e81503f767c303cdb0231",
         "professionalCategory": {
             "es": "Ingeniero",
             "en": "Engineer"
         },
         "unityId": null,
         "positionId": "5d2d918ff182fa4000266b58",
         "cardPositionId": "5d2d918ff182fa4000266b57"
     },
     {
         "id": "amuruzabal",
         "email": { "professional": ["emailupdated@massive-upsert.com"] },
     }
   ]`;
  }

  ngOnInit() {
    this.analyticsService.addAnalytics({ accessTo: 'documentation-api', employee: this.user, userAgent: window.navigator.userAgent }).subscribe();
  }

}

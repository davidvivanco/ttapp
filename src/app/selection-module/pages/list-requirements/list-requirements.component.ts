import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { SelectionApiService } from '../../services/selection.api.services';


@Component({
  selector: 'app-list-requirements',
  templateUrl: './list-requirements.component.html'
})
export class ListRequirementsComponent {

  curriculumAdminIsPublished: boolean;
  schema: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private api: SelectionApiService) {
    this.curriculumAdminIsPublished = false;
    this.getStatusSchema();
  }

  getStatusSchema() {
    this.api.getSchema().subscribe((schema: any) => {
      this.schema = schema;
      this.curriculumAdminIsPublished = (this.schema.published) ? true : false;
    });
  }

  add() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }



}

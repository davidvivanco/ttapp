import { Component, OnInit } from '@angular/core';
import { Block } from '../../classes/block';
import { CurriculumApiService } from '../../services/curriculum.api.service';
import { NotifyService } from '../../../common/services/notify.service';
import { finalize } from 'rxjs/operators';
import { MatDialog } from '@angular/material';

import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Router, ActivatedRoute } from '@angular/router';

import { DeleteConfirmationModalComponent } from '../../../shared/components/shared/modals/delete-confirmation-modal/delete-confirmation-modal.component';


@Component({
  selector: 'app-edit-curriculum',
  templateUrl: './edit-curriculum.component.html',
  styleUrls: ['./edit-curriculum.component.scss']
})
export class EditCurriculumComponent implements OnInit {
  blocks: Block[] = [];
  loading = true;
  creatingBlock = false;
  loadingBlock = false;
  edit = true;
  schema: any;

  constructor(
    private api: CurriculumApiService,
    private notify: NotifyService,
    private router: Router,
    private route: ActivatedRoute,
    private dialog: MatDialog
  ) { }

  ngOnInit() {
    this.getBlocks();
    this.getSchema();
  }

  getSchema() {
    this.api.getSchema().subscribe((data) => {
      this.schema = data;
    });
  }

  publish() {
    this.api.publish().subscribe(() => { this.getSchema(); });
  }

  private getBlocks() {
    this.api.getBlocks().pipe(
      finalize(() => { this.loading = false; })
    ).subscribe(
      (blocks) => {
        this.blocks = blocks;
      },
      () => this.handleError()
    );

  }

  addBlock() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  editBlock(block) {
    this.router.navigate([block._id], { relativeTo: this.route });
  }

  deleteBlock(block: Block, index: number) {
    const dialog = this.dialog.open(DeleteConfirmationModalComponent, { data: { title: 'Borrar Bloque', message: 'Al borrar el bloque, los datos no se podrán recuperar. ¿Estás seguro?' } });

    dialog.afterClosed().subscribe(accepts => {
      if (accepts) {
        this.api.updateStatus('draft').subscribe((res) => {
          this.api.deleteBlock(block).subscribe(
            (result) => {
              this.getBlocks();
              this.getSchema();
            },
            () => this.handleError()
          );
        });
      }
    });
  }

  onSubmit(block: Block, data) {
    const updatedData = { ...block, ...data };
    updatedData.fields = updatedData.fields.map(field => {
      const { validation, _id, value, ...data2 } = field;
      return data2;
    });
    this.loadingBlock = true;
    this.api.updateBlock(updatedData).pipe(
      finalize(() => { this.loadingBlock = false; })
    ).subscribe(
      () => { },
      (error) => this.handleError(),
    );
  }

  handleError() {
    this.notify.error('Ha ocurrido un error y no se han podido actualizar los datos');
  }

  drop(event: CdkDragDrop<string[]>) {
    const index = event.currentIndex;
    moveItemInArray(this.blocks, event.previousIndex, index);

    const nextBlock = this.blocks[index + 1];
    const prevBlock = this.blocks[index - 1];
    const block = this.blocks[index];
    const isLast = index === (this.blocks.length - 1);
    const isFirst = index === 0;

    let order;

    if (isFirst) {
      order = nextBlock.order - 1;
    } else if (isLast) {
      order = prevBlock.order + 1;
    } else {
      order = prevBlock.order + (nextBlock.order - prevBlock.order) / 2;
    }

    block.order = order;

    this.api.updateBlock(block).subscribe(() => { }, () => {
      moveItemInArray(this.blocks, index, event.previousIndex);
    });
    this.getSchema();
  }

}

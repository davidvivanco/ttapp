import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { CurriculumApiService } from '../../services/curriculum.api.service';
import { NotifyService } from '../../../common/services/notify.service';
import { MatDialog } from '@angular/material';
import { LogsMessagesCommon, LogsMessagesBlocks } from '../../../shared/models/logsMessages.interface';
import { TranslateService } from '@ngx-translate/core';
import { ComponentCanDeactivate } from '../../../shared/services/canDeactivate.guard';
import { Block } from '../../classes/block';
import { finalize } from 'rxjs/operators';


@Component({
  selector: 'app-edit-block',
  templateUrl: './edit-block.component.html'
})
export class EditBlockComponent implements OnInit, ComponentCanDeactivate {
  loading = false;
  block;
  isSaved = false;
  isBlockModified = false;
  newBlock: boolean;
  blocks: Block[] = [];
  private translationsKeys: Array<string>; // Para delete mat chips sin afectar al padre hasta que guarde
  private translations: LogsMessagesCommon & LogsMessagesBlocks;


  constructor(
    private api: CurriculumApiService,
    private router: Router,
    private route: ActivatedRoute,
    private notify: NotifyService,
    private dialog: MatDialog,
    private translate: TranslateService
  ) { }

  ngOnInit() {
    this.translationsKeys = [
      'logsMessages.blocks.blockNotExists',
      'logsMessages.common.saveSuccess',
      'logsMessages.blocks.saveError',
    ];
    this.getTranslations();
    this.loading = true;
    this.getBlocks();
    const blockId = this.route.snapshot.paramMap.get('id');
    if (blockId) {
      this.api.getBlock(blockId).subscribe((block) => {
        this.newBlock = false;
        this.block = block;
        this.loading = false;
      },
        () => {
          this.notify.error(this.translations['logsMessages.blocks.blockNotExists']);
          this.goBack();
        });
    } else {
      this.newBlock = true;
      this.block = { name: '', fields: [] };
      this.loading = false;
    }
  }

  getTranslations(): void {
    this.translate.get(this.translationsKeys)
      .subscribe((translations: LogsMessagesCommon & LogsMessagesBlocks) => {
        this.translations = translations;
      });
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

  handleError() {
    this.notify.error('Ha ocurrido un error y no se han podido actualizar los datos');
  }

  saveBlock(data) {
    if (this.newBlock) {
      this.api.createBlock({ order: this.blocks.length + 1 }).subscribe(
        (curriculum: any) => {
          const block = curriculum.blocks.pop();
          this.isBlockModified = false;
          this.api.getBlock(block._id).subscribe((createdBlock) => {
            this.newBlock = false;
            this.block = createdBlock;
            this.loading = false;
            this.api.updateBlock({ ...this.block, ...data }).subscribe(() => {
              this.notify.success(this.translations['logsMessages.common.saveSuccess']);
              this.isSaved = true;
              this.router.navigate([`curriculum/admin/blocks/${block._id}`]);
            }, () => {
              this.notify.error(this.translations['logsMessages.common.saveError']);
            });
          },
            () => {
              this.notify.error(this.translations['logsMessages.blocks.blockNotExists']);
            });
        },
        () => this.notify.error(this.translations['logsMessages.common.saveError'])
      );
    } else {
      this.api.updateBlock({ ...this.block, ...data }).subscribe(() => {
        this.notify.success(this.translations['logsMessages.common.saveSuccess']);
        this.isSaved = true;
      }, () => {
        this.notify.error(this.translations['logsMessages.common.saveError']);
      });
    }
  }

  goBack(data?) {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  isModified(modified) {
    this.isBlockModified = modified;
  }

  canDeactivate() {
    return !this.isBlockModified;
  }

}

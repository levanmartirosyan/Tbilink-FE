import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { Overlay } from '../../../../shared/overlay/overlay';
import { LucideAngularModule } from 'lucide-angular';
import { env } from '../../../../enviroment/enviroment';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ApiService } from '../../../../core/services/api-service';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastService } from '../../../../core/services/toast-service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-post-modal',
  imports: [Overlay, LucideAngularModule, ReactiveFormsModule, CommonModule],
  templateUrl: './edit-post-modal.html',
  styleUrl: './edit-post-modal.scss',
})
export class EditPostModal implements OnInit, OnChanges {
  constructor(
    private sanitizer: DomSanitizer,
    private toastService: ToastService,
    private apiService: ApiService
  ) {}
  @Input() toggleEditPostModal: (() => void) | null = null;
  @Input() postData: any = null;
  @Output() postUpdated = new EventEmitter<void>();

  public env: any = env;

  public filePreview: any = null;

  public editPostForm: FormGroup = new FormGroup({
    id: new FormControl('', [Validators.required]),
    userId: new FormControl('', [Validators.required]),
    content: new FormControl('', [Validators.minLength(1)]),
    imageUrl: new FormControl(''),
  });

  selectedFile: File | null = null;

  ngOnInit(): void {
    this.initializeForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['postData'] && this.postData) {
      this.initializeForm();
    }
  }

  private initializeForm(): void {
    if (this.postData) {
      this.editPostForm.patchValue({
        id: this.postData.id,
        userId: this.postData.userId,
        content: this.postData.content,
      });
      this.selectedFile = null;
      this.filePreview = null;
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0) {
      this.selectedFile = files[0];
      console.log('File selected:', this.selectedFile.name);

      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.filePreview = this.sanitizer.bypassSecurityTrustUrl(
          e.target?.result as string
        );
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  uploadImage(): void {
    if (!this.selectedFile) {
      return this.updatePost();
    }

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.apiService.uploadPublicFile(formData, 'posts').subscribe({
      next: (data: any) => {
        this.editPostForm.patchValue({
          imageUrl: data.data.path,
        });
        this.updatePost();
      },
      error: (err: any) => {
        console.error('File upload failed:', err);
        this.toastService.error('File upload failed. Please try again.');
      },
    });
  }

  private updatePost(): void {
    if (this.editPostForm.invalid) {
      this.toastService.error('Please fill in all required fields.');
      return;
    }

    const updateData: any = {
      id: this.editPostForm.value.id,
      content: this.editPostForm.value.content,
    };

    if (this.selectedFile || this.editPostForm.value.imageUrl) {
      updateData.imageUrl = this.editPostForm.value.imageUrl;
    }

    this.apiService.updatePost(updateData).subscribe({
      next: (postData: any) => {
        this.toastService.success('Post updated successfully.');
        this.postUpdated.emit();
        if (this.toggleEditPostModal) {
          this.toggleEditPostModal();
        }
      },
      error: (err: any) => {
        console.error('Update error:', err);
        this.toastService.error(err.error?.message || 'Failed to update post.');
      },
    });
  }
}

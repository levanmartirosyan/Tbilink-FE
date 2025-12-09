import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from '@angular/core';
import { Overlay } from '../../../../shared/overlay/overlay';
import { LucideAngularModule } from 'lucide-angular';
import { User } from '../../../../core/types/user';
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

@Component({
  selector: 'app-edit-post-modal',
  imports: [Overlay, LucideAngularModule, ReactiveFormsModule],
  templateUrl: './edit-post-modal.html',
  styleUrl: './edit-post-modal.scss',
})
export class EditPostModal implements OnChanges {
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

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['postData'] && this.postData) {
      this.editPostForm.patchValue({
        id: this.postData?.id,
        userId: this.postData?.userId,
        content: this.postData?.content,
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
    if (this.selectedFile === null) {
      this.editPostForm.patchValue({
        imageUrl: '',
      });
      return this.updatePost();
    } else {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.apiService.uploadPublicFile(formData, 'posts').subscribe({
        next: (data: any) => {
          console.log('File uploaded successfully:', data.data.fileUrl);
          this.editPostForm.patchValue({
            imageUrl: data.data.path,
          });

          console.log(this.editPostForm.value);

          this.updatePost();
        },
        error: (err: any) => {
          console.log('File upload failed:', err);
          this.toastService.error('File upload failed. Please try again.');
        },
      });
    }
  }

  updatePost() {
    console.log(this.postData);

    if (this.editPostForm.invalid) {
      this.toastService.error('Please fill in all required fields.');
      return;
    }

    this.apiService.updatePost(this.editPostForm.value).subscribe({
      next: (postData: any) => {
        console.log(postData);
        this.toastService.success('Post updated successfully.');
        this.postUpdated.emit();
        if (this.toggleEditPostModal) {
          this.toggleEditPostModal();
        }
      },
      error: (err: any) => {
        console.log(err);
        this.toastService.error(err.error.message || 'Failed to update post.');
      },
    });
  }
}

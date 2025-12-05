import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { UserService } from '../../../../core/services/user-service';
import { User } from '../../../../core/types/user';
import { Subject, takeUntil } from 'rxjs';
import { SignalRService } from '../../../../core/services/signal-r-service';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastService } from '../../../../core/services/toast-service';
import { ApiService } from '../../../../core/services/api-service';
import { Enviroment } from '../../../../enviroment/enviroment';

@Component({
  selector: 'app-add-post',
  imports: [LucideAngularModule, ReactiveFormsModule],
  templateUrl: './add-post.html',
  styleUrl: './add-post.scss',
})
export class AddPost implements OnInit, OnDestroy {
  constructor(
    public userService: UserService,
    public signalRService: SignalRService,
    private sanitizer: DomSanitizer,
    private toastService: ToastService,
    private apiService: ApiService,
    public env: Enviroment
  ) {}

  @Output() newPostCreated = new EventEmitter<void>();

  public userData!: User | null;
  private destroy$ = new Subject<void>();

  public filePreview: any = null;

  ngOnInit(): void {
    this.getCurrentUser();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getCurrentUser() {
    this.userService.user$.pipe(takeUntil(this.destroy$)).subscribe((u) => {
      this.userData = u;
    });
  }

  public addPostForm: FormGroup = new FormGroup({
    userId: new FormControl(this.userData?.data?.id, [Validators.required]),
    content: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
    ]),
    imageUrl: new FormControl(''),
  });

  selectedFile: File | null = null;

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
      this.addPostForm.patchValue({
        userId: this.userData?.data?.id,
      });
      return this.createPost();
    } else {
      const formData = new FormData();
      formData.append('file', this.selectedFile);

      this.apiService.uploadPublicFile(formData, 'posts').subscribe({
        next: (data: any) => {
          console.log('File uploaded successfully:', data.data.fileUrl);
          this.addPostForm.patchValue({
            userId: this.userData?.data?.id,
            imageUrl: data.data.path,
          });

          console.log(this.addPostForm.value);

          this.createPost();
        },
        error: (err: any) => {
          console.log('File upload failed:', err);
          this.toastService.error('File upload failed. Please try again.');
        },
      });
    }
  }

  createPost(): void {
    if (!this.addPostForm.valid) {
      return this.toastService.error('Please fill in all required fields.');
    }

    this.apiService.createPost(this.addPostForm.value).subscribe({
      next: (postData: any) => {
        console.log('Post created successfully:', postData.data);
        this.toastService.success('Post created successfully.');

        this.addPostForm.reset();
        this.selectedFile = null;
        this.filePreview = null;
        this.getAllPosts();
      },
      error: (err: any) => {
        console.log('Post creation failed:', err);
        this.toastService.error('Post creation failed. Please try again.');
      },
    });
  }

  getAllPosts() {
    this.apiService.getAllPosts().subscribe({
      next: (data: any) => {
        console.log(data);

        this.newPostCreated.emit(data.data);
      },
      error: (err: any) => {
        console.log(err);
      },
    });
  }
}

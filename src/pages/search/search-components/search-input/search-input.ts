import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../../../core/services/common-service';
import { ApiService } from '../../../../core/services/api-service';
import { ToastService } from '../../../../core/services/toast-service';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-search-input',
  imports: [FormsModule, CommonModule, LucideAngularModule],
  templateUrl: './search-input.html',
  styleUrl: './search-input.scss',
})
export class SearchInput implements OnInit {
  constructor(
    private commonService: CommonService,
    private api: ApiService,
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {}

  keyword: string = '';
  public searchData: any;

  ngOnInit(): void {
    // Load default data on component init
    this.loadDefaultData();
  }

  loadDefaultData(): void {
    // Load default data without keyword
    this.api.search('', 'all', 1, 10).subscribe({
      next: (response: any) => {
        console.log('Default search results:', response);
        if (response.isSuccess) {
          this.commonService.setSearchData(response.data);
        }
      },
      error: (err: any) => {
        console.error('Default data load error:', err);
      },
    });
  }

  onSearch() {
    if (this.keyword.trim() === '') {
      this.toastService.warning('Please enter a search keyword.');
      return;
    }

    // Get current search category (all, people, posts)
    const searchCategory =
      this.activatedRoute.firstChild?.snapshot.url[0]?.path || 'all';

    // Store keyword in CommonService
    this.commonService.setSearchKeyword(this.keyword);

    // Perform search with API
    this.api.search(this.keyword, searchCategory, 1, 10).subscribe({
      next: (response: any) => {
        console.log('Search results:', response);
        if (response.isSuccess) {
          this.commonService.setSearchData(response.data);
        } else {
          this.toastService.error('Failed to fetch search results');
        }
      },
      error: (err: any) => {
        console.error('Search error:', err);
        this.toastService.error('An error occurred during search');
      },
    });
  }

  clearSearch(): void {
    this.keyword = '';
    this.commonService.setSearchKeyword('');
    this.loadDefaultData();
  }
}

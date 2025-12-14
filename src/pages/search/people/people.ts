import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommonService } from '../../../core/services/common-service';
import { ApiService } from '../../../core/services/api-service';
import { UserService } from '../../../core/services/user-service';
import { UserCard } from '../search-components/user-card/user-card';

@Component({
  selector: 'app-people',
  imports: [CommonModule, UserCard],
  templateUrl: './people.html',
  styleUrl: './people.scss',
})
export class People implements OnInit {
  constructor(
    private commonService: CommonService,
    private api: ApiService,
    private userService: UserService
  ) {
    this.currentUserId = this.userService.getUser()?.data.id;
  }

  public searchData: any;
  public currentUserId?: string;

  ngOnInit(): void {
    this.initializeSearchData();
  }

  private initializeSearchData(): void {
    const currentData = this.commonService.getSearchData();
    let hasData = false;

    currentData.subscribe((data) => {
      if (data !== null) {
        hasData = true;
        this.updateSearchData();
      }
    });

    if (!hasData) {
      this.loadDefaultData();
    }
  }

  private loadDefaultData(): void {
    this.api.search('', 'people', 1, 10).subscribe({
      next: (response: any) => {
        if (response.isSuccess) {
          this.commonService.setSearchData(response.data);
          this.updateSearchData();
        }
      },
      error: (err: any) => {
        console.error('Default data load error:', err);
      },
    });
  }

  private updateSearchData(): void {
    this.commonService.getSearchData().subscribe((data) => {
      if (data !== null) {
        this.searchData = data;
        this.filterCurrentUser();
      }
    });
  }

  private filterCurrentUser(): void {
    if (this.searchData?.users && this.currentUserId) {
      this.searchData.users = this.searchData.users.filter(
        (user: any) => user.id !== this.currentUserId
      );
    }
  }

  public onFollowToggled(user: any): void {
    console.log('User followed/unfollowed:', user);
  }
}

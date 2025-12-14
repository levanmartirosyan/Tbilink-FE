import { Component } from '@angular/core';
import { SegmentedSwitcher } from '../../shared/segmented-switcher/segmented-switcher';
import { RouterModule } from '@angular/router';
import { SearchInput } from './search-components/search-input/search-input';

@Component({
  selector: 'app-search',
  imports: [SegmentedSwitcher, RouterModule, SearchInput],
  templateUrl: './search.html',
  styleUrl: './search.scss',
})
export class Search {}

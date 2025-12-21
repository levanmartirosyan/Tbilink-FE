import { of } from 'rxjs';
import { Title } from '@angular/platform-browser';
import { Feed } from './feed';

describe('Feed (unit)', () => {
  let feed: Feed;
  let mockApi: any;
  let mockTitle: Title;

  beforeEach(() => {
    mockApi = {
      getAllPostsPaginated: jasmine.createSpy('getAllPostsPaginated'),
    };

    mockTitle = { setTitle: jasmine.createSpy('setTitle') } as any;

    feed = new Feed(mockApi, mockTitle);
  });

  it('loads first page and sets postData/hasMorePosts', (done) => {
    const page1 = [
      { id: 1, createdAt: '2025-12-20T12:00:00Z' },
      { id: 2, createdAt: '2025-12-20T11:00:00Z' },
    ];

    mockApi.getAllPostsPaginated.and.returnValue(
      of({ data: { data: page1, hasNextPage: true } })
    );

    // call method
    feed.getAllPosts();

    // subscription is synchronous for `of()` so we can assert immediately
    expect(feed.postData.length).toBe(2);
    expect((feed as any).hasMorePosts).toBeTrue();
    expect((feed as any).currentPage).toBe(2);
    done();
  });

  it('appends subsequent pages', (done) => {
    const page1 = [{ id: 1, createdAt: '2025-12-20T12:00:00Z' }];
    const page2 = [{ id: 2, createdAt: '2025-12-20T13:00:00Z' }];

    // first page response
    mockApi.getAllPostsPaginated.and.returnValues(
      of({ data: { data: page1, hasNextPage: true } }),
      of({ data: { data: page2, hasNextPage: false } })
    );

    // load first page
    feed.getAllPosts();
    expect(feed.postData.length).toBe(1);

    // simulate loading second page
    feed.getAllPosts();
    expect(feed.postData.length).toBe(2);
    expect((feed as any).hasMorePosts).toBeFalse();
    expect((feed as any).currentPage).toBe(3);
    done();
  });

  it('does not call API when already loading or no more posts', () => {
    feed.isLoading = true;
    feed.getAllPosts();
    expect(mockApi.getAllPostsPaginated).not.toHaveBeenCalled();

    feed.isLoading = false;
    (feed as any).hasMorePosts = false;
    feed.getAllPosts();
    expect(mockApi.getAllPostsPaginated).not.toHaveBeenCalled();
  });
});

import { Subject, of } from 'rxjs';
import { NavigationEnd } from '@angular/router';
import { Auth } from './auth';

describe('Auth (unit)', () => {
  let auth: Auth;
  let mockTheme: any;
  let mockTitle: any;
  let navigation$: Subject<any>;
  let mockRouter: any;
  let mockActR: any;

  beforeEach(() => {
    mockTheme = {};
    mockTitle = { setTitle: jasmine.createSpy('setTitle') };

    navigation$ = new Subject<any>();
    mockRouter = { events: navigation$.asObservable() };

    // initial activated route snapshot + firstChild
    mockActR = {
      snapshot: { firstChild: { routeConfig: { path: 'signup' } } },
      firstChild: {
        snapshot: { routeConfig: { path: 'signup' } },
        firstChild: null,
      },
    };

    auth = new Auth(mockTheme, mockTitle, mockRouter, mockActR);
  });

  it('sets title on init based on snapshot path', () => {
    // ngOnInit should read snapshot.firstChild and call setTitle
    auth.ngOnInit();
    expect(mockTitle.setTitle).toHaveBeenCalledWith('Tbilink - Sign Up');
  });

  it('updates title on NavigationEnd using deepest child route', () => {
    auth.ngOnInit();

    // change activated route structure so deepest child has path 'recovery'
    mockActR.firstChild = {
      firstChild: {
        snapshot: { routeConfig: { path: 'recovery' } },
        firstChild: null,
      },
      snapshot: { routeConfig: { path: 'intermediate' } },
    };

    // emit NavigationEnd
    navigation$.next(new NavigationEnd(1, '/recovery', '/recovery'));

    expect(mockTitle.setTitle).toHaveBeenCalledWith(
      'Tbilink - Password Recovery'
    );
  });
});

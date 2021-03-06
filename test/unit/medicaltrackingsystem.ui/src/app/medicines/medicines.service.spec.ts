import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';
import { Medicines } from '../../api/mts/mts.json';
import { MedicinesService } from './medicines.service';

const moviesToUse = [ Medicines
];

describe('MedicinesService', () => {
  let serviceUnderTest: MedicinesService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [MedicinesService]
    });

    serviceUnderTest = TestBed.get(MedicinesService);
    http = TestBed.get(HttpTestingController);
  });

  it('should be created', () => {
    expect(serviceUnderTest).toBeTruthy();
  });

  it('should return the favorite medicines from the backend', () => {
    let result: any ;
    serviceUnderTest.getFavoriteMovies().subscribe(data => {
      result = data;
    });

    const req = http.expectOne(environment.favoriteUrl);
    expect(req.request.method).toEqual('GET');

    req.flush(moviesToUse);
    http.verify();
  });

  it('should fail if the backend returns an error 3 times in a row', () => {
    let bubblesUpTheError = false;
    serviceUnderTest.getFavoriteMovies().subscribe(() => {}, () => (bubblesUpTheError = true));

    const req = http.expectOne(environment.favoriteUrl, 'expected to make an initial request');
    expect(req.request.method).toEqual('GET');
    req.flush('ERROR', { status: 500, statusText: 'Internal server error' });

    const req1 = http.expectOne(environment.favoriteUrl, 'expected to make a second request');
    expect(req1.request.method).toEqual('GET');
    req1.flush('ERROR', { status: 500, statusText: 'Internal server error' });

    const req2 = http.expectOne(environment.favoriteUrl, 'exected to make a third request');
    expect(req2.request.method).toEqual('GET');
    req2.flush('ERROR', { status: 500, statusText: 'Internal server error' });

    expect(bubblesUpTheError).toBeTruthy();
    http.verify();
  });

  it('should return the list of favorite medicines if the backend returns an error 2 times and the succeds', () => {
    let favoriteMovies: any;
    serviceUnderTest.getFavoriteMovies().subscribe(data => {
      favoriteMovies = data;
    });

    const req = http.expectOne(environment.favoriteUrl, 'expected to make an initial request');
    expect(req.request.method).toEqual('GET');
    req.flush('ERROR', { status: 500, statusText: 'Internal server error' });

    const req1 = http.expectOne(environment.favoriteUrl, 'expected to make a second request');
    expect(req1.request.method).toEqual('GET');
    req1.flush('ERROR', { status: 500, statusText: 'Internal server error' });

    const req2 = http.expectOne(environment.favoriteUrl, 'exected to make a third request');
    expect(req2.request.method).toEqual('GET');
    req2.flush(moviesToUse);

    expect(favoriteMovies).toEqual(moviesToUse);
    http.verify();
  });
});

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExtractService {
    private readonly apiUrl = 'http://localhost:8000/api/extract-images';

    constructor(private http: HttpClient) { }

    extractImages(file: File): Observable<Blob> {
        const formData = new FormData();
        formData.append('file', file, file.name);

        return this.http.post(this.apiUrl, formData, {
            responseType: 'blob',
        });
    }
}

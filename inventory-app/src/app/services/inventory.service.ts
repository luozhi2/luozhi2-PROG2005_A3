import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Item, ItemPayload } from '../models/item.model';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private readonly endpoint = 'https://prog2005.it.scu.edu.au/ArtGalley';

  constructor(private http: HttpClient) {}

  getAllItems(): Observable<Item[]> {
    return this.http.get<Item[]>(`${this.endpoint}/`);
  }

  getItemByName(name: string): Observable<Item> {
    return this.http.get<Item>(`${this.endpoint}/${encodeURIComponent(name)}`);
  }

  addItem(payload: ItemPayload): Observable<Item> {
    return this.http.post<Item>(`${this.endpoint}/`, payload);
  }

  updateItem(name: string, payload: ItemPayload): Observable<Item> {
    return this.http.put<Item>(`${this.endpoint}/${encodeURIComponent(name)}`, payload);
  }

  deleteItem(name: string): Observable<{ message?: string }> {
    return this.http.delete<{ message?: string }>(`${this.endpoint}/${encodeURIComponent(name)}`);
  }
}

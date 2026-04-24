import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonSearchbar,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { InventoryService } from '../services/inventory.service';
import { Item } from '../models/item.model';
import { firstValueFrom } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { isMeaningfulItemName } from '../utils/item-name.util';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    IonSearchbar,
    IonButton,
    IonList,
    IonItem,
    IonLabel,
    IonText,
    IonSpinner,
  ],
})
export class Tab1Page {
  items: Item[] = [];
  searchName = '';
  loading = false;
  errorMessage = '';

  constructor(
    private inventory: InventoryService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
  ) {}

  ionViewWillEnter(): void {
    const q = this.route.snapshot.queryParamMap.get('search')?.trim() ?? '';
    if (q) {
      this.searchName = q;
      void this.search();
      return;
    }
    void this.loadAll();
  }

  async loadAll(): Promise<void> {
    this.loading = true;
    this.errorMessage = '';
    try {
      const allItems = await firstValueFrom(this.inventory.getAllItems());
      const invalidItems = allItems.filter((item) => !isMeaningfulItemName(item.item_name ?? ''));

      if (invalidItems.length) {
        for (const item of invalidItems) {
          try {
            await firstValueFrom(this.inventory.deleteItem(item.item_name));
          } catch {
            // Ignore individual deletion failure and keep cleaning others.
          }
        }
      }

      this.items = allItems.filter((item) => isMeaningfulItemName(item.item_name ?? ''));
    } catch (e) {
      this.errorMessage = 'Failed to load items. Please check your connection and try again.';
    } finally {
      this.loading = false;
    }
  }

  async search(): Promise<void> {
    const name = this.searchName.trim();
    if (!name) {
      await this.loadAll();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    try {
      const directMatch = await firstValueFrom(this.inventory.getItemByName(name));
      if (directMatch && isMeaningfulItemName(directMatch.item_name ?? '')) {
        this.items = [directMatch];
        return;
      }

      const allItems = await firstValueFrom(this.inventory.getAllItems());
      const normalizedName = name.toLowerCase();
      const fallbackMatch = allItems.find(
        (item) =>
          isMeaningfulItemName(item.item_name ?? '') &&
          item.item_name.trim().toLowerCase() === normalizedName,
      );

      if (fallbackMatch) {
        this.items = [fallbackMatch];
        return;
      }

      this.items = [];
      this.errorMessage = `No valid item found for name "${name}".`;
    } catch (e) {
      try {
        const allItems = await firstValueFrom(this.inventory.getAllItems());
        const normalizedName = name.toLowerCase();
        const fallbackMatch = allItems.find(
          (item) =>
            isMeaningfulItemName(item.item_name ?? '') &&
            item.item_name.trim().toLowerCase() === normalizedName,
        );
        if (fallbackMatch) {
          this.items = [fallbackMatch];
          return;
        }
        this.items = [];
        this.errorMessage = `No valid item found for name "${name}".`;
      } catch {
        this.items = [];
        this.errorMessage = 'Search failed. Please try again.';
      }
    } finally {
      this.loading = false;
    }
  }

  openForEdit(itemName: string): void {
    const name = itemName.trim();
    if (!name) {
      return;
    }
    void this.router.navigate(['/tabs/tab3'], {
      queryParams: { item: name },
    });
  }

  async showHelp(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Inventory list & search',
      message:
        'Use the search bar to find a single item by its unique name. Clear the search to reload all items.',
      buttons: ['OK'],
    });
    await alert.present();
  }
}

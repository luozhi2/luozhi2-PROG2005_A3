import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { CATEGORIES, STOCK_STATUSES } from '../models/item.model';
import { InventoryService } from '../services/inventory.service';
import { ActivatedRoute } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { isMeaningfulItemName } from '../utils/item-name.util';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
    IonItem,
    IonLabel,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonButton,
    IonText,
    IonSpinner,
  ],
})
export class Tab3Page {
  readonly categories = CATEGORIES;
  readonly stockStatuses = STOCK_STATUSES;

  lookupName = '';
  loadedName: string | null = null;
  loading = false;
  message = '';
  errorMessage = '';

  form = this.fb.nonNullable.group({
    item_name: ['', [Validators.required, Validators.minLength(1)]],
    category: ['', [Validators.required]],
    quantity: [0, [Validators.required, Validators.min(0)]],
    price: [0, [Validators.required]],
    supplier_name: ['', [Validators.required, Validators.minLength(1)]],
    stock_status: ['', [Validators.required]],
    featured_item: [0, [Validators.required]],
    special_note: [''],
  });

  constructor(
    private fb: FormBuilder,
    private inventory: InventoryService,
    private route: ActivatedRoute,
    private alertController: AlertController,
  ) {}

  ionViewWillEnter(): void {
    const itemName = this.route.snapshot.queryParamMap.get('item')?.trim() ?? '';
    if (!itemName) {
      return;
    }
    this.lookupName = itemName;
    void this.loadByName();
  }

  async loadByName(): Promise<void> {
    const name = this.lookupName.trim();
    this.message = '';
    this.errorMessage = '';
    if (!name) {
      this.errorMessage = 'Please enter an item name to load.';
      return;
    }

    this.loading = true;
    try {
      const item = await firstValueFrom(this.inventory.getItemByName(name));
      if (!item) {
        this.loadedName = null;
        this.errorMessage = `No item found for name "${name}".`;
        return;
      }
      this.loadedName = item.item_name;
      this.form.reset({
        item_name: item.item_name ?? '',
        category: item.category ?? this.categories[0],
        quantity: item.quantity ?? 0,
        price: item.price ?? 0,
        supplier_name: item.supplier_name ?? '',
        stock_status: item.stock_status ?? this.stockStatuses[0],
        featured_item: item.featured_item ?? 0,
        special_note: item.special_note ?? '',
      });
      this.message = 'Item loaded. You can update or delete it below.';
    } catch {
      this.loadedName = null;
      this.errorMessage = 'Failed to load item. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async update(): Promise<void> {
    this.message = '';
    this.errorMessage = '';
    if (!this.loadedName) {
      this.errorMessage = 'Load an item first.';
      return;
    }
    if (this.form.invalid) {
      this.errorMessage = 'Please fix the form errors before updating.';
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const updatedName = v.item_name.trim();
    if (!isMeaningfulItemName(updatedName)) {
      this.errorMessage = 'Item name is not specific enough. Please enter a real-world name.';
      return;
    }
    this.loading = true;
    try {
      await firstValueFrom(
        this.inventory.updateItem(this.loadedName, {
          item_name: updatedName,
          category: v.category,
          quantity: Number(v.quantity),
          price: Number(v.price),
          supplier_name: v.supplier_name.trim(),
          stock_status: v.stock_status,
          featured_item: Number(v.featured_item) ? 1 : 0,
          special_note: v.special_note?.trim() ? v.special_note.trim() : null,
        }),
      );
      this.message = 'Item updated successfully.';
      this.loadedName = updatedName;
      this.lookupName = this.loadedName;
    } catch {
      this.errorMessage = 'Failed to update item. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async delete(): Promise<void> {
    this.message = '';
    this.errorMessage = '';
    const name = (this.loadedName ?? this.lookupName).trim();
    if (!name) {
      this.errorMessage = 'Please enter an item name to delete.';
      return;
    }

    this.loading = true;
    try {
      await firstValueFrom(this.inventory.deleteItem(name));
      this.message = `Item "${name}" deleted successfully.`;
      this.loadedName = null;
      this.lookupName = '';
      this.form.reset({
        item_name: '',
        category: this.categories[0],
        quantity: 0,
        price: 0,
        supplier_name: '',
        stock_status: this.stockStatuses[0],
        featured_item: 0,
        special_note: '',
      });
    } catch {
      this.errorMessage =
        name.toLowerCase() === 'laptop'
          ? 'Deletion of "Laptop" is forbidden by the server.'
          : 'Failed to delete item. Please try again.';
    } finally {
      this.loading = false;
    }
  }

  async showHelp(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Update & delete',
      message:
        "Load an item by its unique name. Then update fields and save, or delete the item by name. Note: deleting 'Laptop' is forbidden by the server.",
      buttons: ['OK'],
    });
    await alert.present();
  }
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
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
  IonList,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonText,
  IonTitle,
  IonToggle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { firstValueFrom } from 'rxjs';
import { InventoryService } from '../services/inventory.service';
import { CATEGORIES, Item, STOCK_STATUSES } from '../models/item.model';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { isMeaningfulItemName } from '../utils/item-name.util';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
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
    IonToggle,
    IonButton,
    IonList,
    IonText,
    IonSpinner,
  ],
})
export class Tab2Page {
  readonly categories = CATEGORIES;
  readonly stockStatuses = STOCK_STATUSES;

  featuredItems: Item[] = [];
  loading = false;
  message = '';
  errorMessage = '';
  recentlyAddedName = '';

  form = this.fb.nonNullable.group({
    item_name: ['', [Validators.required, Validators.minLength(1)]],
    category: ['', [Validators.required]],
    quantity: [0, [Validators.required, Validators.min(0)]],
    price: [0, [Validators.required]],
    supplier_name: ['', [Validators.required, Validators.minLength(1)]],
    stock_status: ['', [Validators.required]],
    featured_item: [false],
    special_note: [''],
  });

  constructor(
    private fb: FormBuilder,
    private inventory: InventoryService,
    private router: Router,
    private alertController: AlertController,
  ) {}

  ionViewWillEnter(): void {
    void this.loadFeatured();
  }

  async loadFeatured(): Promise<void> {
    try {
      const items = await firstValueFrom(this.inventory.getAllItems());
      this.featuredItems = items.filter((i) => (i.featured_item ?? 0) > 0);
    } catch {
      // keep silent; featured list is optional UI
    }
  }

  async addItem(): Promise<void> {
    this.message = '';
    this.errorMessage = '';
    this.recentlyAddedName = '';
    if (this.form.invalid) {
      this.errorMessage = 'Please fix the form errors before submitting.';
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const createdName = v.item_name.trim();
    if (!isMeaningfulItemName(createdName)) {
      this.errorMessage = 'Item name is not specific enough. Please enter a real-world name.';
      return;
    }
    this.loading = true;
    try {
      await firstValueFrom(
        this.inventory.addItem({
          item_name: createdName,
          category: v.category,
          quantity: Number(v.quantity),
          price: Number(v.price),
          supplier_name: v.supplier_name.trim(),
          stock_status: v.stock_status,
          featured_item: v.featured_item ? 1 : 0,
          special_note: v.special_note?.trim() ? v.special_note.trim() : null,
        }),
      );
      this.message = `Item "${createdName}" added successfully.`;
      this.recentlyAddedName = createdName;
      this.form.reset({
        item_name: '',
        category: this.categories[0],
        quantity: 0,
        price: 0,
        supplier_name: '',
        stock_status: this.stockStatuses[0],
        featured_item: false,
        special_note: '',
      });
      await this.loadFeatured();
    } catch (e) {
      this.errorMessage = 'Failed to add item. Make sure the item name is unique and try again.';
    } finally {
      this.loading = false;
    }
  }

  goToList(): void {
    if (!this.recentlyAddedName) {
      return;
    }
    void this.router.navigate(['/tabs/tab1'], {
      queryParams: { search: this.recentlyAddedName },
    });
  }

  async showHelp(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Add item',
      message:
        'Fill in the form to create a new inventory record. Item Name must be unique. Featured Item will appear in the featured list below.',
      buttons: ['OK'],
    });
    await alert.present();
  }
}

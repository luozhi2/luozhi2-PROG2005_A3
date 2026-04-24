import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonTitle,
  IonToolbar,
} from '@ionic/angular/standalone';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonContent,
    IonCard,
    IonCardHeader,
    IonCardTitle,
    IonCardContent,
  ],
})
export class Tab4Page {
  constructor(private alertController: AlertController) {}

  async showHelp(): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Privacy & Security',
      message:
        'This page explains how inventory data is handled, protected, and what users should do to keep accounts and devices secure.',
      buttons: ['OK'],
    });
    await alert.present();
  }
}

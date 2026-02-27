import { Component } from '@angular/core';
import { UploadComponent } from './components/upload/upload.component';
import { ToastContainerComponent } from './components/toast/toast-container.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [UploadComponent, ToastContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class App {
  currentYear = new Date().getFullYear();
}

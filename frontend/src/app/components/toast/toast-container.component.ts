import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, Toast } from '../../services/toast.service';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-wrapper">
      <div
        *ngFor="let toast of toasts; trackBy: trackById"
        class="toast-card"
        [ngClass]="'toast-' + toast.type"
        [style.animation]="toast.leaving ? 'slide-out-right 0.3s ease forwards' : 'slide-in-right 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards'"
      >
        <!-- Icon -->
        <div class="toast-icon">
          <svg *ngIf="toast.type === 'success'" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <svg *ngIf="toast.type === 'error'" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <svg *ngIf="toast.type === 'warning'" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"/>
          </svg>
          <svg *ngIf="toast.type === 'info'" width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>

        <!-- Content -->
        <div class="toast-body">
          <p class="toast-title">{{ toast.title }}</p>
          <p class="toast-message">{{ toast.message }}</p>
        </div>

        <!-- Close button -->
        <button class="toast-close" (click)="dismiss(toast.id)">
          <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    .toast-wrapper {
      position: fixed;
      top: 1.5rem;
      right: 1.5rem;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      width: 24rem;
      max-width: calc(100vw - 2rem);
    }

    .toast-card {
      display: flex;
      align-items: flex-start;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 0.75rem;
      box-shadow: 0 20px 50px rgba(0,0,0,0.3);
      border: 1px solid transparent;
      backdrop-filter: blur(16px);
      will-change: transform, opacity;
    }

    .toast-success {
      background: linear-gradient(135deg, rgba(6, 78, 59, 0.85), rgba(30, 41, 59, 0.9));
      border-color: rgba(52, 211, 153, 0.25);
    }
    .toast-success .toast-icon { color: #34d399; }

    .toast-error {
      background: linear-gradient(135deg, rgba(127, 29, 29, 0.85), rgba(30, 41, 59, 0.9));
      border-color: rgba(248, 113, 113, 0.25);
    }
    .toast-error .toast-icon { color: #f87171; }

    .toast-warning {
      background: linear-gradient(135deg, rgba(120, 53, 15, 0.85), rgba(30, 41, 59, 0.9));
      border-color: rgba(251, 191, 36, 0.25);
    }
    .toast-warning .toast-icon { color: #fbbf24; }

    .toast-info {
      background: linear-gradient(135deg, rgba(30, 58, 138, 0.85), rgba(30, 41, 59, 0.9));
      border-color: rgba(96, 165, 250, 0.25);
    }
    .toast-info .toast-icon { color: #60a5fa; }

    .toast-icon {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .toast-body {
      flex: 1;
      min-width: 0;
    }

    .toast-title {
      font-size: 0.875rem;
      font-weight: 600;
      color: #ffffff;
      margin: 0;
    }

    .toast-message {
      font-size: 0.75rem;
      color: #cbd5e1;
      margin: 0.25rem 0 0;
      line-height: 1.5;
    }

    .toast-close {
      flex-shrink: 0;
      padding: 0.25rem;
      border-radius: 0.5rem;
      border: none;
      background: transparent;
      color: #94a3b8;
      cursor: pointer;
      transition: background 0.2s, color 0.2s;
    }

    .toast-close:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #ffffff;
    }
  `],
})
export class ToastContainerComponent {
  toasts: Toast[] = [];

  constructor(private toastService: ToastService) {
    this.toastService.toasts$.subscribe(toasts => {
      this.toasts = toasts;
    });
  }

  trackById(_index: number, toast: Toast): number {
    return toast.id;
  }

  dismiss(id: number): void {
    this.toastService.dismiss(id);
  }
}

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface Toast {
    id: number;
    type: 'success' | 'error' | 'info' | 'warning';
    title: string;
    message: string;
    leaving?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private counter = 0;
    private toastsSubject = new BehaviorSubject<Toast[]>([]);
    toasts$ = this.toastsSubject.asObservable();

    show(type: Toast['type'], title: string, message: string, duration = 5000): void {
        const id = ++this.counter;
        const toast: Toast = { id, type, title, message };
        this.toastsSubject.next([...this.toastsSubject.value, toast]);

        setTimeout(() => this.dismiss(id), duration);
    }

    dismiss(id: number): void {
        const toasts = this.toastsSubject.value.map(t =>
            t.id === id ? { ...t, leaving: true } : t
        );
        this.toastsSubject.next(toasts);
        setTimeout(() => {
            this.toastsSubject.next(this.toastsSubject.value.filter(t => t.id !== id));
        }, 300);
    }
}

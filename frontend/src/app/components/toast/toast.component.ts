import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService, ToastMessage } from '../../services/toast.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-toasts',
    imports: [CommonModule],
    standalone: true,
    template: `
    <div class="toasts-wrapper">
        <div *ngFor="let t of toasts" class="toast" [ngClass]="'toast-'+t.type">{{ t.text }}</div>
    </div>
    `,
    styles: [
        `.toasts-wrapper { position: fixed; top: 16px; right: 16px; z-index: 2000; }
         .toast { margin-bottom: 8px; padding: 10px 14px; border-radius: 6px; color: white; box-shadow: 0 6px 18px rgba(0,0,0,0.12); }
         .toast-info { background: #2196f3; }
         .toast-success { background: #4caf50; }
         .toast-error { background: #f44336; }
         .toast-warning { background: #ff9800; }
        `
    ]
})
export class ToastComponent implements OnInit, OnDestroy {
    toasts: ToastMessage[] = [];
    sub: Subscription | null = null;

    constructor(private toast: ToastService) {}

    ngOnInit() {
        this.sub = this.toast.onToast().subscribe(t => {
            const id = Date.now() + Math.random();
            t.id = id;
            this.toasts.push(t);
            setTimeout(() => this.removeToast(id), t.timeout || 3000);
        });
    }

    removeToast(id?: number) {
        if (!id) return;
        this.toasts = this.toasts.filter(t => t.id !== id);
    }

    ngOnDestroy() {
        this.sub?.unsubscribe();
    }
}


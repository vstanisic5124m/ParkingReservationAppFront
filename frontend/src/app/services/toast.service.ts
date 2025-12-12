import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface ToastMessage {
    id?: number;
    text: string;
    type?: 'info' | 'success' | 'error' | 'warning';
    timeout?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    private subject = new Subject<ToastMessage>();

    onToast(): Observable<ToastMessage> {
        return this.subject.asObservable();
    }

    show(text: string, type: ToastMessage['type'] = 'info', timeout = 3000) {
        this.subject.next({ text, type, timeout });
    }

    success(text: string, timeout = 3000) {
        this.show(text, 'success', timeout);
    }

    error(text: string, timeout = 4000) {
        this.show(text, 'error', timeout);
    }

    info(text: string, timeout = 3000) {
        this.show(text, 'info', timeout);
    }

    warn(text: string, timeout = 4000) {
        this.show(text, 'warning', timeout);
    }
}


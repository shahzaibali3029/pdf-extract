import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { ExtractService } from '../../services/extract.service';
import { ToastService } from '../../services/toast.service';

type AppState = 'idle' | 'selected' | 'uploading' | 'done';

@Component({
    selector: 'app-upload',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './upload.component.html',
    styleUrl: './upload.component.css',
})
export class UploadComponent {
    state = signal<AppState>('idle');
    isDragOver = signal(false);
    selectedFile = signal<File | null>(null);
    downloadUrl = signal<string | null>(null);
    downloadName = signal<string>('images.zip');

    fileSize = computed(() => {
        const file = this.selectedFile();
        if (!file) return '';
        const kb = file.size / 1024;
        if (kb < 1024) return `${kb.toFixed(1)} KB`;
        return `${(kb / 1024).toFixed(2)} MB`;
    });

    constructor(
        private extractService: ExtractService,
        private toastService: ToastService,
    ) { }

    // ── Drag-and-drop handlers ────────────────────────────────

    onDragOver(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver.set(true);
    }

    onDragLeave(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver.set(false);
    }

    onDrop(event: DragEvent): void {
        event.preventDefault();
        event.stopPropagation();
        this.isDragOver.set(false);

        const files = event.dataTransfer?.files;
        if (files && files.length > 0) {
            this.handleFile(files[0]);
        }
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files.length > 0) {
            this.handleFile(input.files[0]);
            input.value = ''; // allow re-selection of the same file
        }
    }

    private handleFile(file: File): void {
        if (file.type !== 'application/pdf') {
            this.toastService.show('error', 'Invalid File', 'Only PDF files are allowed. Please select a .pdf file.');
            return;
        }
        this.selectedFile.set(file);
        this.state.set('selected');
        // Cleanup old download URL if any
        if (this.downloadUrl()) {
            URL.revokeObjectURL(this.downloadUrl()!);
            this.downloadUrl.set(null);
        }
    }

    // ── Extract action ────────────────────────────────────────

    extract(): void {
        const file = this.selectedFile();
        if (!file) return;

        this.state.set('uploading');

        this.extractService.extractImages(file).subscribe({
            next: (blob: Blob) => {
                const url = URL.createObjectURL(blob);
                const name = file.name.replace(/\.pdf$/i, '') + '_images.zip';
                this.downloadUrl.set(url);
                this.downloadName.set(name);
                this.state.set('done');
                this.toastService.show('success', 'Extraction Complete', `Images extracted successfully from "${file.name}".`);
            },
            error: (err: HttpErrorResponse) => {
                this.state.set('selected');
                let message = 'An unexpected error occurred. Please try again.';

                if (err.status === 0) {
                    message = 'Unable to connect to the server. Make sure the backend is running on port 8000.';
                } else if (err.error instanceof Blob) {
                    // FastAPI errors come as JSON blobs since we requested responseType: 'blob'
                    const reader = new FileReader();
                    reader.onload = () => {
                        try {
                            const json = JSON.parse(reader.result as string);
                            this.toastService.show('error', 'Extraction Failed', json.detail || message);
                        } catch {
                            this.toastService.show('error', 'Extraction Failed', message);
                        }
                    };
                    reader.readAsText(err.error);
                    return;
                } else if (err.error?.detail) {
                    message = err.error.detail;
                }

                this.toastService.show('error', 'Extraction Failed', message);
            },
        });
    }

    // ── Download action ───────────────────────────────────────

    download(): void {
        const url = this.downloadUrl();
        if (!url) return;

        const a = document.createElement('a');
        a.href = url;
        a.download = this.downloadName();
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    // ── Reset ─────────────────────────────────────────────────

    reset(): void {
        if (this.downloadUrl()) {
            URL.revokeObjectURL(this.downloadUrl()!);
        }
        this.selectedFile.set(null);
        this.downloadUrl.set(null);
        this.state.set('idle');
    }
}

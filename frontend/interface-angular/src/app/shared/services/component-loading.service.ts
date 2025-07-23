// component-loading.service.ts
import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class ComponentLoadingService {
    private loadingStates = signal<Record<string, boolean>>({});

    // Inicia o loading para um componente específico
    startLoading(componentName: string) {
        this.loadingStates.update((states) => ({
            ...states,
            [componentName]: true,
        }));
    }

    // Para o loading de um componente específico
    stopLoading(componentName: string) {
        this.loadingStates.update((states) => ({
            ...states,
            [componentName]: false,
        }));
    }

    // Verifica se um componente está carregando
    isLoading(componentName: string): boolean {
        return this.loadingStates()[componentName] || false;
    }
}
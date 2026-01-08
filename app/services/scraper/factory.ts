import { ScraperEngine, ScraperType } from "./types";
import * as engines from "./engines";

const allEngines: ScraperEngine<unknown>[] = Object.values(engines);

/**
 * Internal factory that manages and retrieves scraper engines by type
 */
class ScraperEngineFactory {
    private static instance: ScraperEngineFactory | null = null;
    private readonly enginesByType: Map<string, ScraperEngine<unknown>[]>;

    private constructor() {
        this.enginesByType = new Map();

        for (const engine of allEngines) {
            const existing = this.enginesByType.get(engine.type) ?? [];
            existing.push(engine);
            this.enginesByType.set(engine.type, existing);
        }

        for (const [type, typeEngines] of this.enginesByType) {
            this.enginesByType.set(
                type,
                typeEngines.sort((a, b) => a.priority - b.priority),
            );
        }
    }

    public static getInstance(): ScraperEngineFactory {
        return (ScraperEngineFactory.instance ??= new ScraperEngineFactory());
    }

    /**
     * Get all enabled engines for a specific type
     */
    public getEngines<T>(type: ScraperType): ScraperEngine<T>[] {
        const typeEngines = this.enginesByType.get(type) ?? [];
        return typeEngines.filter(e => e.isEnabled()) as ScraperEngine<T>[];
    }
}

export const scraperEngineFactory = ScraperEngineFactory.getInstance();

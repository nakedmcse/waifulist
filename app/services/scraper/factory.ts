import { ScraperEngine, ScraperType } from "./types";
import * as engines from "./engines";

type AnyScraperEngine = ScraperEngine<unknown, unknown>;

const allEngines: AnyScraperEngine[] = Object.values(engines);

class ScraperEngineFactory {
    private static instance: ScraperEngineFactory | null = null;
    private readonly enginesByType: Map<string, AnyScraperEngine[]>;

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

    public getEngines<T, Args>(type: ScraperType): ScraperEngine<T, Args>[] {
        const typeEngines = this.enginesByType.get(type) ?? [];
        return typeEngines.filter(e => e.isEnabled()) as ScraperEngine<T, Args>[];
    }
}

export const scraperEngineFactory = ScraperEngineFactory.getInstance();

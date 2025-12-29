export async function register() {
    if (process.env.NEXT_RUNTIME === "nodejs") {
        const { startScheduler } = await import("./app/services/scheduler");
        const { loadAnimeData } = await import("./app/services/animeData");

        startScheduler();
        loadAnimeData();
    }
}

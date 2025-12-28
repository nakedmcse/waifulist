import { AsyncTask, CronJob, ToadScheduler } from "toad-scheduler";
import { refreshAnimeData } from "./animeData";

const scheduler = new ToadScheduler();
let isSchedulerStarted = false;

export function startScheduler() {
    if (isSchedulerStarted) {
        console.log("[Scheduler] Already running");
        return;
    }

    const task = new AsyncTask(
        "refresh-anime",
        async () => {
            console.log(`[Scheduler] Starting anime data refresh at ${new Date().toISOString()}`);
            const result = await refreshAnimeData();
            if (result.success) {
                console.log(`[Scheduler] Successfully refreshed ${result.count} anime entries`);
            } else {
                console.error("[Scheduler] Failed to refresh anime data");
            }
        },
        err => {
            console.error("[Scheduler] Error during refresh:", err);
        },
    );

    const job = new CronJob({ cronExpression: "0 0 * * *" }, task, { preventOverrun: true });

    scheduler.addCronJob(job);
    isSchedulerStarted = true;
    console.log("[Scheduler] Started. Anime data will refresh daily at midnight");
}

export function stopScheduler() {
    scheduler.stop();
    isSchedulerStarted = false;
    console.log("[Scheduler] Stopped");
}

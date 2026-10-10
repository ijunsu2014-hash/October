import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { AppError } from "../common/errors/app-error";

interface QueueEntry {
  queueId: string;
  rating: number;
}

@Injectable()
export class MatchingService {
  private queue: QueueEntry[] = [];

  enqueue(rating: number): { queueId: string; status: "queued" | "matched" } {
    const queueId = randomUUID();
    this.queue.push({ queueId, rating });
    return { queueId, status: "queued" };
  }

  cancel(queueId: string): boolean {
    const before = this.queue.length;
    this.queue = this.queue.filter((e) => e.queueId !== queueId);
    if (this.queue.length === before) {
      throw new AppError("NOT_FOUND", "Queue entry not found", 404);
    }
    return true;
  }
}

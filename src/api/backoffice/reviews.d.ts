export function listReviewQueue({ limit, skip }?: {
    limit?: number;
    skip?: number;
}): Promise<unknown>;
export function approveReview(id: any): Promise<unknown>;
export function rejectReview(id: any): Promise<unknown>;
export function moderateReview(id: any, status: any): Promise<unknown>;

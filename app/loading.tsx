"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
	return (
		<div className="min-h-dvh flex items-center justify-center p-6">
			<div className="w-full max-w-xl space-y-6">
				<div className="flex items-center gap-3">
					<Skeleton className="h-10 w-10 rounded-full" />
					<div className="space-y-2 w-full">
						<Skeleton className="h-4 w-1/3" />
						<Skeleton className="h-3 w-1/4" />
					</div>
				</div>
				<div className="space-y-3">
					<Skeleton className="h-6 w-2/3" />
					<Skeleton className="h-4 w-full" />
					<Skeleton className="h-4 w-5/6" />
					<Skeleton className="h-4 w-4/6" />
				</div>
				<div className="grid grid-cols-3 gap-3">
					<Skeleton className="h-24" />
					<Skeleton className="h-24" />
					<Skeleton className="h-24" />
				</div>
			</div>
		</div>
	);
}



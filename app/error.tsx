"use client";

import { ErrorState } from "@/components/layout/ErrorState";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error("Route error:", error);
	}, [error]);

	let kind: "server" | "network" | "timeout" | "unknown" = "unknown";
	const message = String(error?.message ?? "");
	if (message.includes("NetworkError") || message.includes("Failed to fetch")) kind = "network";
	else if (message.toLowerCase().includes("timeout") || message.toLowerCase().includes("timed out")) kind = "timeout";
	else if (message.includes("500") || message.toLowerCase().includes("server")) kind = "server";

	return (
		<ErrorState
			kind={kind}
			extra={
				<div className="p-6 pt-0 text-xs text-muted-foreground break-all">
					{error?.digest && <div>에러 ID: {error.digest}</div>}
					{message && <div className="mt-1">메시지: {message}</div>}
				</div>
			}
			title={undefined}
			description={undefined}
			onRetry={() => reset()}
		/>
	);
}



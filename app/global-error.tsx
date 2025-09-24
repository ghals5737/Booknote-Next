"use client";

import { ErrorState } from "@/components/layout/ErrorState";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error("Global error:", error);
	}, [error]);

	return (
		<html>
			<body>
				<ErrorState
					kind="server"
					title="치명적 오류가 발생했어요"
					description="예기치 못한 문제가 발생했습니다. 새로고침 후 다시 시도해주세요."
					onRetry={() => reset()}
					extra={
						<div className="p-6 pt-0 text-xs text-muted-foreground break-all">
							{error?.digest && <div>에러 ID: {error.digest}</div>}
						</div>
					}
				/>
			</body>
		</html>
	);
}



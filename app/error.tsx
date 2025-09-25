"use client";

import { ErrorState } from "@/components/layout/ErrorState";
import { ErrorHandler } from "@/lib/error-handler";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error("Route error:", error);
	}, [error]);

	const errorKind = ErrorHandler.getErrorKind(error);
	const errorMessage = ErrorHandler.extractErrorMessage(error);
	const errorId = error?.digest || ErrorHandler.generateErrorId();

	return (
		<ErrorState
			kind={errorKind}
			title="페이지 로드 중 오류가 발생했어요"
			description={errorMessage}
			errorId={errorId}
			extra={
				process.env.NODE_ENV === 'development' && (
					<div className="p-6 pt-0 text-xs text-muted-foreground break-all">
						<details className="cursor-pointer">
							<summary className="font-medium mb-2">개발자 정보</summary>
							<div className="space-y-1">
								<div><strong>원본 메시지:</strong> {String(error?.message ?? "")}</div>
								<div><strong>스택 트레이스:</strong></div>
								<pre className="mt-1 p-2 bg-muted rounded text-xs overflow-auto max-h-32">
									{error?.stack}
								</pre>
							</div>
						</details>
					</div>
				)
			}
			onRetry={() => reset()}
		/>
	);
}



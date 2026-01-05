"use client";

import { ErrorState } from "@/components/layout/ErrorState";
import { ErrorHandler } from "@/lib/error-handler";
import { useEffect } from "react";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
	useEffect(() => {
		console.error("Global error:", error);
	}, [error]);

	const errorKind = ErrorHandler.getErrorKind(error);
	const errorMessage = ErrorHandler.extractErrorMessage(error);
	const errorId = error?.digest || ErrorHandler.generateErrorId();

	return (
		<html lang="ko">
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<title>오류 발생 - Booknote</title>
			</head>
			<body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
				<ErrorState
					kind={errorKind}
					title="치명적 오류가 발생했어요"
					description={errorMessage || "예기치 못한 문제가 발생했습니다. 새로고침 후 다시 시도해주세요."}
					errorId={errorId}
					onRetry={() => reset()}
					showHomeButton={true}
					showBackButton={false}
					extra={
						<div className="p-6 pt-0 text-xs text-muted-foreground break-all">
							{process.env.NODE_ENV === 'development' && (
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
							)}
						</div>
					}
				/>
			</body>
		</html>
	);
}



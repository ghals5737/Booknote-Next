"use client";

import { useToastContext } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, ArrowLeft, Bug, Copy, Globe, Home, Network, RefreshCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";

type ErrorKind = "server" | "network" | "timeout" | "auth" | "not-found" | "validation" | "unknown";

interface ErrorStateProps {
	title?: string;
	description?: string;
	kind?: ErrorKind;
	onRetry?: () => void;
	extra?: ReactNode;
	errorId?: string;
	showHomeButton?: boolean;
	showBackButton?: boolean;
}

export function ErrorState({
	title,
	description,
	kind = "unknown",
	onRetry,
	extra,
	errorId,
	showHomeButton = true,
	showBackButton = true,
}: ErrorStateProps) {
	const router = useRouter();
	
	// ToastProvider가 없을 수도 있으므로 안전하게 처리
	let toast: ((options: { title?: string; description?: string; variant?: 'default' | 'destructive' | 'success' | 'warning' }) => string) | null = null;
	try {
		const toastContext = useToastContext();
		toast = toastContext.toast;
	} catch {
		// ToastProvider가 없는 경우 무시
		toast = null;
	}
	
	const [isRetrying, setIsRetrying] = useState(false);

	const icon = {
		server: <AlertTriangle className="h-5 w-5 text-red-500" />,
		network: <Network className="h-5 w-5 text-orange-500" />,
		timeout: <RefreshCcw className="h-5 w-5 text-yellow-500" />,
		auth: <AlertTriangle className="h-5 w-5 text-red-500" />,
		"not-found": <Globe className="h-5 w-5 text-blue-500" />,
		validation: <Bug className="h-5 w-5 text-yellow-500" />,
		unknown: <Globe className="h-5 w-5 text-muted-foreground" />,
	}[kind];

	const defaultText: Record<ErrorKind, { title: string; description: string }> = {
		server: {
			title: "서버 오류가 발생했어요",
			description: "잠시 후 다시 시도하거나, 문제가 지속되면 문의해주세요.",
		},
		network: {
			title: "네트워크 연결에 문제가 있어요",
			description: "인터넷 연결을 확인한 뒤 다시 시도해주세요.",
		},
		timeout: {
			title: "응답이 지연되고 있어요",
			description: "서버 응답이 오래 걸리고 있습니다. 잠시 후 다시 시도해주세요.",
		},
		auth: {
			title: "인증이 필요해요",
			description: "로그인이 필요하거나 세션이 만료되었습니다.",
		},
		"not-found": {
			title: "페이지를 찾을 수 없어요",
			description: "요청하신 페이지가 존재하지 않거나 이동되었을 수 있습니다.",
		},
		validation: {
			title: "입력 정보를 확인해주세요",
			description: "입력하신 정보에 오류가 있습니다. 다시 확인해주세요.",
		},
		unknown: {
			title: "문제가 발생했어요",
			description: "예상치 못한 오류가 발생했습니다. 다시 시도해주세요.",
		},
	};

	const handleRetry = async () => {
		if (onRetry) {
			setIsRetrying(true);
			try {
				await onRetry();
				toast?.({
					title: "다시 시도 완료",
					description: "요청을 다시 처리했습니다.",
					variant: "success"
				});
			} catch (error) {
				toast?.({
					title: "재시도 실패",
					description: "다시 시도했지만 문제가 지속됩니다.",
					variant: "destructive"
				});
				console.error("재시도 실패:", error);
			} finally {
				setIsRetrying(false);
			}
		}
	};

	const handleGoHome = () => {
		router.push('/dashboard');
	};

	const handleGoBack = () => {
		router.back();
	};

	const handleCopyErrorId = () => {
		if (errorId) {
			navigator.clipboard.writeText(errorId);
			toast?.({
				title: "에러 ID 복사됨",
				description: "고객 지원 시 이 ID를 제공해주세요.",
				variant: "success"
			});
		}
	};

	return (
		<div className="w-full min-h-[50vh] flex items-center justify-center p-6">
			<div className="w-full max-w-xl rounded-lg border bg-card text-card-foreground">
				<div className="p-6 flex items-center gap-3">
					{icon}
					<div className="flex-1">
						<h2 className="text-lg font-semibold">
							{title ?? defaultText[kind].title}
						</h2>
						<p className="text-sm text-muted-foreground">
							{description ?? defaultText[kind].description}
						</p>
					</div>
				</div>
				<Separator />
				<div className="p-6 space-y-4">
					<div className="flex items-center justify-between gap-3">
						<div className="text-xs text-muted-foreground">
							오류 유형: <span className="font-medium">{kind}</span>
							{errorId && (
								<>
									{" • "}
									<span className="font-mono">ID: {errorId}</span>
									<button
										onClick={handleCopyErrorId}
										className="ml-1 inline-flex items-center gap-1 hover:text-foreground transition-colors"
									>
										<Copy className="h-3 w-3" />
									</button>
								</>
							)}
						</div>
					</div>
					
					<div className="flex flex-wrap items-center gap-2">
						{showHomeButton && (
							<Button variant="outline" size="sm" onClick={handleGoHome}>
								<Home className="h-4 w-4 mr-2" />
								홈으로
							</Button>
						)}
						{showBackButton && (
							<Button variant="outline" size="sm" onClick={handleGoBack}>
								<ArrowLeft className="h-4 w-4 mr-2" />
								뒤로가기
							</Button>
						)}
						<Button 
							variant="secondary" 
							size="sm"
							onClick={() => (location.href = location.href)}
						>
							<RefreshCcw className="h-4 w-4 mr-2" />
							새로고침
						</Button>
						{onRetry && (
							<Button 
								size="sm"
								onClick={handleRetry}
								disabled={isRetrying}
							>
								{isRetrying ? (
									<RefreshCcw className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<RefreshCcw className="h-4 w-4 mr-2" />
								)}
								다시 시도
							</Button>
						)}
					</div>
				</div>
				{extra}
			</div>
		</div>
	);
}



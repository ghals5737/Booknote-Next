"use client";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Globe, Network, RefreshCcw } from "lucide-react";
import { ReactNode } from "react";

type ErrorKind = "server" | "network" | "timeout" | "unknown";

interface ErrorStateProps {
	title?: string;
	description?: string;
	kind?: ErrorKind;
	onRetry?: () => void;
	extra?: ReactNode;
}

export function ErrorState({
	title,
	description,
	kind = "unknown",
	onRetry,
	extra,
}: ErrorStateProps) {
	const icon = {
		server: <AlertTriangle className="h-5 w-5 text-red-500" />,
		network: <Network className="h-5 w-5 text-orange-500" />,
		timeout: <RefreshCcw className="h-5 w-5 text-yellow-500 animate-spin-slow" />,
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
		unknown: {
			title: "문제가 발생했어요",
			description: "예상치 못한 오류가 발생했습니다. 다시 시도해주세요.",
		},
	};

	return (
		<div className="w-full min-h-[50vh] flex items-center justify-center p-6">
			<div className="w-full max-w-xl rounded-lg border bg-card text-card-foreground">
				<div className="p-6 flex items-center gap-3">
					{icon}
					<div>
						<h2 className="text-lg font-semibold">
							{title ?? defaultText[kind].title}
						</h2>
						<p className="text-sm text-muted-foreground">
							{description ?? defaultText[kind].description}
						</p>
					</div>
				</div>
				<Separator />
				<div className="p-6 flex items-center justify-between gap-3">
					<div className="text-xs text-muted-foreground">
						오류 유형: <span className="font-medium">{kind}</span>
					</div>
					<div className="flex items-center gap-2">
						<Button variant="secondary" onClick={() => (location.href = location.href)}>
							새로고침
						</Button>
						{onRetry && (
							<Button onClick={onRetry}>다시 시도</Button>
						)}
					</div>
				</div>
				{extra}
			</div>
		</div>
	);
}



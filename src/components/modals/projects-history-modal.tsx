'use client';

import React from 'react';
import { Clock, Trash2, X } from 'lucide-react';
import { ProjectItem } from '@/types/storage';

interface ProjectsHistoryModalProps {
	opened: boolean;
	projects: ProjectItem[];
	onSelectProject: (project: ProjectItem) => void;
	onDeleteProject: (id: string, e: React.MouseEvent) => void;
	onClose: () => void;
}

export const ProjectsHistoryModal: React.FC<ProjectsHistoryModalProps> = ({
	opened,
	projects,
	onSelectProject,
	onDeleteProject,
	onClose,
}) => {
	if (!opened) return null;

	const formatDate = (timestamp: number) => {
		const d = new Date(timestamp);
		return d.toLocaleString('uk-UA', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit',
		});
	};

	return (
		<div
			style={{
				position: 'fixed',
				inset: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.7)',
				backdropFilter: 'blur(8px)',
				zIndex: 100,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '1rem',
			}}
			onClick={onClose}
		>
			<div
				style={{
					backgroundColor: 'rgba(22, 23, 27, 0.98)',
					border: '1px solid var(--line-strong)',
					borderRadius: '0.875rem',
					boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7)',
					width: 'min(420px, 100%)',
					maxHeight: '80vh',
					display: 'flex',
					flexDirection: 'column',
					overflow: 'hidden',
				}}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Header */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '0.85rem 1rem',
						borderBottom: '1px solid var(--line)',
					}}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
						<Clock className="icon" style={{ color: 'var(--text-secondary)' }} />
						<span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>
							Історія проектів
						</span>
						<span
							style={{
								fontSize: '0.75rem',
								color: 'var(--muted)',
								fontVariantNumeric: 'tabular-nums',
							}}
						>
							({projects.length}/50)
						</span>
					</div>
					<button
						type="button"
						style={{
							color: 'var(--muted)',
							cursor: 'pointer',
							padding: '0.25rem',
							display: 'flex',
						}}
						onClick={onClose}
						aria-label="Закрити"
					>
						<X className="icon" />
					</button>
				</div>

				{/* List */}
				<div
					style={{
						flex: 1,
						overflowY: 'auto',
						padding: '0.5rem',
						display: 'flex',
						flexDirection: 'column',
						gap: '0.5rem',
					}}
				>
					{projects.length === 0 ? (
						<div
							style={{
								padding: '2.5rem 1rem',
								textAlign: 'center',
								color: 'var(--muted)',
								fontSize: '0.875rem',
							}}
						>
							Немає збережених проектів
						</div>
					) : (
						projects.map((item) => (
							<div
								key={item.id}
								style={{
									display: 'flex',
									alignItems: 'center',
									gap: '0.75rem',
									padding: '0.45rem 0.65rem',
									borderRadius: '0.625rem',
									backgroundColor: 'var(--panel-2)',
									border: '1px solid var(--line)',
									cursor: 'pointer',
									transition: 'background 0.12s',
								}}
								onClick={() => onSelectProject(item)}
							>
								{/* Thumbnail */}
								<div
									style={{
										width: '50px',
										height: '50px',
										borderRadius: '0.4rem',
										backgroundColor: '#000000',
										border: '1px solid var(--line)',
										overflow: 'hidden',
										flexShrink: 0,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
									}}
								>
									{item.thumbnail ? (
										// eslint-disable-next-line @next/next/no-img-element
										<img
											src={item.thumbnail}
											alt={item.title}
											style={{ width: '100%', height: '100%', objectFit: 'contain' }}
										/>
									) : (
										<div
											style={{
												width: '100%',
												height: '100%',
												backgroundColor: '#ffffff',
											}}
										/>
									)}
								</div>

								{/* Info */}
								<div style={{ flex: 1, minWidth: 0 }}>
									<div
										style={{
											fontSize: '0.85rem',
											fontWeight: 600,
											color: 'var(--text)',
											whiteSpace: 'nowrap',
											overflow: 'hidden',
											textOverflow: 'ellipsis',
										}}
									>
										{item.title}
									</div>
									<div
										style={{
											fontSize: '0.75rem',
											color: 'var(--muted)',
											marginTop: '0.15rem',
											fontVariantNumeric: 'tabular-nums',
										}}
									>
										{formatDate(item.updatedAt)} • {item.stamps.length} нот
									</div>
								</div>

								{/* Delete Button */}
								<button
									type="button"
									style={{
										padding: '0.4rem',
										color: 'var(--muted)',
										cursor: 'pointer',
										borderRadius: '0.35rem',
										display: 'flex',
									}}
									onClick={(e) => onDeleteProject(item.id, e)}
									aria-label="Видалити проект"
									title="Видалити проект"
								>
									<Trash2 className="icon" />
								</button>
							</div>
						))
					)}
				</div>
			</div>
		</div>
	);
};

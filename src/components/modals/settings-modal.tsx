'use client';

import React, { useState } from 'react';
import {
	Eraser,
	Layers,
	ListOrdered,
	Maximize2,
	Music,
	Pencil,
	PenTool,
	Plus,
	RotateCcw,
	Ruler,
	Settings,
	Stamp,
	Trash2,
	Type,
	X,
} from 'lucide-react';
import { StampCategory, ToolMode } from '@/types/editor';

interface SettingsModalProps {
	opened: boolean;
	visibleTools: Record<ToolMode, boolean>;
	visibleStampCategories: Record<StampCategory, boolean>;
	deleteBtnOn: boolean;
	resizeHandlesOn: boolean;
	onToggleTool: (tool: ToolMode) => void;
	onToggleStampCategory: (category: StampCategory) => void;
	onToggleDeleteBtn: () => void;
	onToggleResizeHandles: () => void;
	onResetDefaults: () => void;
	onClose: () => void;
}

const TOOLS_CONFIG: { id: ToolMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
	{ id: 'pencil', label: 'Олівець', icon: Pencil },
	{ id: 'stamp', label: 'Штамп', icon: Stamp },
	{ id: 'ruler', label: 'Лінійка', icon: Ruler },
	{ id: 'eraser', label: 'Гумка', icon: Eraser },
];

const CATEGORIES_CONFIG: {
	id: StampCategory;
	label: string;
	icon: React.ComponentType<{ className?: string }>;
}[] = [
	{ id: 'notes', label: 'Ноти', icon: Music },
	{ id: 'chords', label: 'Акорди', icon: Layers },
	{ id: 'count', label: 'Рахунок', icon: ListOrdered },
	{ id: 'custom', label: 'Власні', icon: Plus },
	{ id: 'text', label: 'Текст', icon: Type },
	{ id: 'draw', label: 'Малюнок', icon: PenTool },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
	opened,
	visibleTools,
	visibleStampCategories,
	deleteBtnOn,
	resizeHandlesOn,
	onToggleTool,
	onToggleStampCategory,
	onToggleDeleteBtn,
	onToggleResizeHandles,
	onResetDefaults,
	onClose,
}) => {
	const [confirmReset, setConfirmReset] = useState(false);

	if (!opened) return null;

	const handleResetClick = () => {
		if (confirmReset) {
			setConfirmReset(false);
			onResetDefaults();
		} else {
			setConfirmReset(true);
			setTimeout(() => {
				setConfirmReset(false);
			}, 4000);
		}
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
					width: 'min(440px, 100%)',
					maxHeight: '85vh',
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
						<Settings className="icon" style={{ color: 'var(--text-secondary)' }} />
						<span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text)' }}>
							Налаштування
						</span>
					</div>
					<button
						type="button"
						style={{
							color: 'var(--muted)',
							cursor: 'pointer',
							padding: '0.25rem',
							display: 'flex',
							background: 'transparent',
							border: 'none',
						}}
						onClick={onClose}
						aria-label="Закрити"
					>
						<X className="icon" />
					</button>
				</div>

				{/* Scrollable Content */}
				<div
					style={{
						padding: '0.85rem 1rem',
						overflowY: 'auto',
						display: 'flex',
						flexDirection: 'column',
						gap: '1rem',
					}}
				>
					{/* Група 1: Інструменти */}
					<div>
						<div
							style={{
								fontSize: '0.75rem',
								fontWeight: 600,
								color: 'var(--muted)',
								textTransform: 'uppercase',
								letterSpacing: '0.05em',
								marginBottom: '0.5rem',
							}}
						>
							Інструменти
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
							{TOOLS_CONFIG.map(({ id, label, icon: Icon }) => {
								const isChecked = visibleTools[id] ?? true;
								return (
									<button
										key={id}
										type="button"
										style={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
											width: '100%',
											padding: '0.6rem 0.75rem',
											borderRadius: '0.5rem',
											background: 'rgba(255, 255, 255, 0.03)',
											border: '1px solid var(--line)',
											cursor: 'pointer',
											color: 'var(--text)',
											textAlign: 'left',
										}}
										onClick={() => onToggleTool(id)}
									>
										<div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
											<Icon className="icon" />
											<span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
										</div>
										<span className={`sw ${isChecked ? 'on' : ''}`} />
									</button>
								);
							})}
						</div>
					</div>

					{/* Група 2: Розділи штампу */}
					<div>
						<div
							style={{
								fontSize: '0.75rem',
								fontWeight: 600,
								color: 'var(--muted)',
								textTransform: 'uppercase',
								letterSpacing: '0.05em',
								marginBottom: '0.5rem',
							}}
						>
							Розділи штампу
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
							{CATEGORIES_CONFIG.map(({ id, label, icon: Icon }) => {
								const isChecked = visibleStampCategories[id] ?? true;
								return (
									<button
										key={id}
										type="button"
										style={{
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'space-between',
											width: '100%',
											padding: '0.6rem 0.75rem',
											borderRadius: '0.5rem',
											background: 'rgba(255, 255, 255, 0.03)',
											border: '1px solid var(--line)',
											cursor: 'pointer',
											color: 'var(--text)',
											textAlign: 'left',
										}}
										onClick={() => onToggleStampCategory(id)}
									>
										<div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
											<Icon className="icon" />
											<span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{label}</span>
										</div>
										<span className={`sw ${isChecked ? 'on' : ''}`} />
									</button>
								);
							})}
						</div>
					</div>

					{/* Група 3: Керування на полотні */}
					<div>
						<div
							style={{
								fontSize: '0.75rem',
								fontWeight: 600,
								color: 'var(--muted)',
								textTransform: 'uppercase',
								letterSpacing: '0.05em',
								marginBottom: '0.5rem',
							}}
						>
							Штамп на полотні
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
							<button
								type="button"
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									width: '100%',
									padding: '0.6rem 0.75rem',
									borderRadius: '0.5rem',
									background: 'rgba(255, 255, 255, 0.03)',
									border: '1px solid var(--line)',
									cursor: 'pointer',
									color: 'var(--text)',
									textAlign: 'left',
								}}
								onClick={onToggleDeleteBtn}
							>
								<div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
									<Trash2 className="icon" />
									<span style={{ fontSize: '0.875rem', fontWeight: 500 }}>Кошик на штампі</span>
								</div>
								<span className={`sw ${deleteBtnOn ? 'on' : ''}`} />
							</button>

							<button
								type="button"
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'space-between',
									width: '100%',
									padding: '0.6rem 0.75rem',
									borderRadius: '0.5rem',
									background: 'rgba(255, 255, 255, 0.03)',
									border: '1px solid var(--line)',
									cursor: 'pointer',
									color: 'var(--text)',
									textAlign: 'left',
								}}
								onClick={onToggleResizeHandles}
							>
								<div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
									<Maximize2 className="icon" />
									<span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
										Хендли розміру на рамці
									</span>
								</div>
								<span className={`sw ${resizeHandlesOn ? 'on' : ''}`} />
							</button>
						</div>
					</div>

					{/* Група 4: Скидання до дефолтних налаштувань */}
					<div style={{ paddingTop: '0.5rem', borderTop: '1px solid var(--line)' }}>
						<button
							type="button"
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								gap: '0.5rem',
								width: '100%',
								padding: '0.65rem 0.75rem',
								borderRadius: '0.5rem',
								background: confirmReset ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.08)',
								border: confirmReset ? '1px solid #ef4444' : '1px solid rgba(239, 68, 68, 0.25)',
								color: '#ef4444',
								cursor: 'pointer',
								fontWeight: 600,
								fontSize: '0.875rem',
								transition: 'all 0.15s ease',
							}}
							onClick={handleResetClick}
						>
							<RotateCcw className="icon" />
							<span>
								{confirmReset
									? 'Підтвердити: скинути все до дефолтних?'
									: 'Скинути налаштування до дефолтних'}
							</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	);
};


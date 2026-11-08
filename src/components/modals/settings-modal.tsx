'use client';

import React, { useState } from 'react';
import {
	Eraser,
	Layers,
	ListOrdered,
	Maximize2,
	MousePointer,
	Music,
	Pencil,
	PenTool,
	Plus,
	RotateCcw,
	Ruler,
	Settings,
	Shapes,
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
	compactRulers?: boolean;
	onToggleTool: (tool: ToolMode) => void;
	onToggleStampCategory: (category: StampCategory) => void;
	onToggleDeleteBtn: () => void;
	onToggleResizeHandles: () => void;
	onToggleCompactRulers?: () => void;
	onResetSettings: () => void;
	onClearAllData: () => void;
	onClose: () => void;
}

const TOOLS_CONFIG: { id: ToolMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
	{ id: 'select', label: 'Виділення', icon: MousePointer },
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
	{ id: 'shapes', label: 'Фігури', icon: Shapes },
];

export const SettingsModal: React.FC<SettingsModalProps> = ({
	opened,
	visibleTools,
	visibleStampCategories,
	deleteBtnOn,
	resizeHandlesOn,
	compactRulers = false,
	onToggleTool,
	onToggleStampCategory,
	onToggleDeleteBtn,
	onToggleResizeHandles,
	onToggleCompactRulers,
	onResetSettings,
	onClearAllData,
	onClose,
}) => {
	const [confirmModal, setConfirmModal] = useState<'settings' | 'all' | null>(null);

	if (!opened) return null;

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
					position: 'relative',
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

					{/* Група 4: Панель лінійок */}
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
							Панель лінійок
						</div>
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
							onClick={onToggleCompactRulers}
						>
							<div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
								<Ruler className="icon" />
								<div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
									<span style={{ fontSize: '0.875rem', fontWeight: 500 }}>
										Компактний вигляд у топбарі
									</span>
									<span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
										{compactRulers
											? 'Усі кнопки лінійок розташовані зверху в один рядок'
											: 'Основний вигляд: панель у 2 колонки над футером'}
									</span>
								</div>
							</div>
							<span className={`sw ${compactRulers ? 'on' : ''}`} />
						</button>
					</div>

					{/* Група 5: Скидання */}
					<div
						style={{
							paddingTop: '0.65rem',
							borderTop: '1px solid var(--line)',
							display: 'flex',
							flexDirection: 'column',
							gap: '0.5rem',
						}}
					>
						{/* Кнопка 1: скидання тільки налаштувань */}
						<button
							type="button"
							style={{
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								gap: '0.5rem',
								width: '100%',
								padding: '0.55rem 0.75rem',
								borderRadius: '0.5rem',
								background: 'transparent',
								border: '1px solid rgba(239, 68, 68, 0.25)',
								color: '#ef4444',
								cursor: 'pointer',
								fontWeight: 500,
								fontSize: '0.85rem',
							}}
							onClick={() => setConfirmModal('settings')}
						>
							<RotateCcw className="icon" style={{ width: '1rem', height: '1rem' }} />
							<span>Скинути налаштування</span>
						</button>

						{/* Кнопка 2: повне очищення всіх даних */}
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
								background: 'rgba(239, 68, 68, 0.1)',
								border: '1px solid rgba(239, 68, 68, 0.35)',
								color: '#ef4444',
								cursor: 'pointer',
								fontWeight: 600,
								fontSize: '0.875rem',
							}}
							onClick={() => setConfirmModal('all')}
						>
							<Trash2 className="icon" style={{ width: '1rem', height: '1rem' }} />
							<span>Очистити всі дані</span>
						</button>
					</div>
				</div>

				{/* Модальне вікно підтвердження */}
				{confirmModal && (
					<div
						style={{
							position: 'absolute',
							inset: 0,
							backgroundColor: 'rgba(0, 0, 0, 0.8)',
							backdropFilter: 'blur(4px)',
							zIndex: 20,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							padding: '1rem',
						}}
						onClick={() => setConfirmModal(null)}
					>
						<div
							style={{
								backgroundColor: 'rgba(24, 25, 30, 0.99)',
								border: '1px solid var(--line-strong)',
								borderRadius: '0.75rem',
								padding: '1.25rem',
								width: '100%',
								maxWidth: '320px',
								boxShadow: '0 16px 36px rgba(0, 0, 0, 0.8)',
							}}
							onClick={(e) => e.stopPropagation()}
						>
							<div
								style={{
									fontWeight: 600,
									fontSize: '0.95rem',
									color: 'var(--text)',
									marginBottom: '0.4rem',
								}}
							>
								{confirmModal === 'settings'
									? 'Скинути налаштування?'
									: 'Очистити всі дані?'}
							</div>
							<div
								style={{
									fontSize: '0.825rem',
									color: 'var(--muted)',
									lineHeight: 1.4,
									marginBottom: '1.25rem',
								}}
							>
								{confirmModal === 'settings'
									? 'Усі налаштування інструментів та штампів повернуться до початкових. Малюнок на полотні збережеться.'
									: 'Буде повністю видалено історію проектів, сесію та налаштування. Додаток повернеться до початкового стану.'}
							</div>
							<div
								style={{
									display: 'flex',
									gap: '0.5rem',
									justifyContent: 'flex-end',
								}}
							>
								<button
									type="button"
									style={{
										padding: '0.45rem 0.85rem',
										borderRadius: '0.375rem',
										background: 'rgba(255, 255, 255, 0.08)',
										border: '1px solid var(--line)',
										color: 'var(--text)',
										cursor: 'pointer',
										fontSize: '0.825rem',
										fontWeight: 500,
									}}
									onClick={() => setConfirmModal(null)}
								>
									Відміна
								</button>
								<button
									type="button"
									style={{
										padding: '0.45rem 0.95rem',
										borderRadius: '0.375rem',
										background: '#dc2626',
										border: 'none',
										color: '#ffffff',
										cursor: 'pointer',
										fontSize: '0.825rem',
										fontWeight: 600,
									}}
									onClick={() => {
										const action = confirmModal;
										setConfirmModal(null);
										if (action === 'settings') {
											onResetSettings();
										} else {
											onClearAllData();
										}
									}}
								>
									Так
								</button>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};


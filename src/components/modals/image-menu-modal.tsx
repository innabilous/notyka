'use client';

import React from 'react';
import {
	Clock,
	Download,
	FilePlus,
	ImagePlus,
	RotateCcw,
	Settings,
	Share2,
} from 'lucide-react';

interface ImageMenuModalProps {
	opened: boolean;
	onClose?: () => void;
	onUploadClick: () => void;
	onNewBlank: () => void;
	onOpenHistory: () => void;
	onOpenSettings: () => void;
	onClear: () => void;
	onSave: () => void;
	onShare: () => void;
}

export const ImageMenuModal: React.FC<ImageMenuModalProps> = ({
	opened,
	onClose,
	onUploadClick,
	onNewBlank,
	onOpenHistory,
	onOpenSettings,
	onClear,
	onSave,
	onShare,
}) => {
	if (!opened) return null;

	const handleBackdropClick = (e: React.MouseEvent) => {
		e.stopPropagation();
		e.preventDefault();
		onClose?.();
	};

	return (
		<>
			{/* Бекдроп для блокування взаємодії з полотном/штампами та закриття меню при кліку повз */}
			<div
				className="menu-backdrop"
				onClick={handleBackdropClick}
				onMouseDown={(e) => e.stopPropagation()}
				onPointerDown={(e) => e.stopPropagation()}
			/>

			<div
				id="image-menu"
				className="popup"
				onClick={(e) => e.stopPropagation()}
				onMouseDown={(e) => e.stopPropagation()}
			>
				{/* Група 1: Робота з полотном */}
				<button id="btn-upload" type="button" className="c-indigo" onClick={onUploadClick}>
					<ImagePlus className="icon" />
					<span style={{ color: 'var(--text)' }}>Відкрити фото</span>
				</button>

				<button id="btn-new-blank" type="button" className="c-indigo-l" onClick={onNewBlank}>
					<FilePlus className="icon" />
					<span>Новий білий аркуш</span>
				</button>

				<button id="btn-history" type="button" className="c-indigo" onClick={onOpenHistory}>
					<Clock className="icon" />
					<span style={{ color: 'var(--text)' }}>Історія проектів</span>
				</button>

				<div className="menu-divider" />

				{/* Група 2: Експорт */}
				<button id="btn-save" type="button" className="c-green" onClick={onSave}>
					<Download className="icon" />
					<span>Зберегти фото</span>
				</button>

				<button id="btn-share" type="button" className="c-sky" onClick={onShare}>
					<Share2 className="icon" />
					<span>Поділитися</span>
				</button>

				<div className="menu-divider" />

				{/* Група 3: Опції та очищення */}
				<button
					id="btn-settings-submenu"
					type="button"
					className="c-indigo"
					onClick={(e) => {
						e.stopPropagation();
						onOpenSettings();
					}}
				>
					<Settings className="icon" />
					<span style={{ color: 'var(--text)', flex: 1 }}>Налаштування</span>
				</button>

				<button id="btn-clear" type="button" className="c-red" onClick={onClear}>
					<RotateCcw className="icon" />
					<span>Очистити аркуш</span>
				</button>
			</div>
		</>
	);
};

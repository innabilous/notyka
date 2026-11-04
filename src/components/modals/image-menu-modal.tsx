'use client';

import React from 'react';
import {
	Clock,
	Download,
	FilePlus,
	ImagePlus,
	Maximize2,
	RotateCcw,
	Share2,
	Trash2,
} from 'lucide-react';

interface ImageMenuModalProps {
	opened: boolean;
	deleteBtnOn: boolean;
	resizeHandlesOn: boolean;
	onUploadClick: () => void;
	onNewBlank: () => void;
	onOpenHistory: () => void;
	onClear: () => void;
	onSave: () => void;
	onShare: () => void;
	onToggleDeleteBtn: () => void;
	onToggleResizeHandles: () => void;
}

export const ImageMenuModal: React.FC<ImageMenuModalProps> = ({
	opened,
	deleteBtnOn,
	resizeHandlesOn,
	onUploadClick,
	onNewBlank,
	onOpenHistory,
	onClear,
	onSave,
	onShare,
	onToggleDeleteBtn,
	onToggleResizeHandles,
}) => {
	if (!opened) return null;

	return (
		<div id="image-menu" className="popup" onClick={(e) => e.stopPropagation()}>
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
				id="btn-toggle-delete"
				type="button"
				className="c-indigo"
				onClick={onToggleDeleteBtn}
			>
				<Trash2 className="icon" style={{ color: deleteBtnOn ? '#ef4444' : 'var(--muted)' }} />
				<span style={{ color: 'var(--text)', flex: 1 }}>Кошик на штампі</span>
				<span id="sw-delete" className={`sw ${deleteBtnOn ? 'on' : ''}`} />
			</button>

			<button
				id="btn-toggle-resize-handles"
				type="button"
				className="c-indigo"
				onClick={onToggleResizeHandles}
			>
				<Maximize2
					className="icon"
					style={{ color: resizeHandlesOn ? '#0ea5e9' : 'var(--muted)' }}
				/>
				<span style={{ color: 'var(--text)', flex: 1 }}>Хендли розміру на рамці</span>
				<span id="sw-resize" className={`sw ${resizeHandlesOn ? 'on' : ''}`} />
			</button>

			<button id="btn-clear" type="button" className="c-red" onClick={onClear}>
				<RotateCcw className="icon" />
				<span>Очистити аркуш</span>
			</button>
		</div>
	);
};

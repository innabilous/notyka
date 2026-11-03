'use client';

import React from 'react';
import { Clock, FilePlus, FolderOpen, Save, Share2, Trash2 } from 'lucide-react';

interface ImageMenuModalProps {
	opened: boolean;
	deleteBtnOn: boolean;
	onUploadClick: () => void;
	onNewBlank: () => void;
	onOpenHistory: () => void;
	onClear: () => void;
	onSave: () => void;
	onShare: () => void;
	onToggleDeleteBtn: () => void;
}

export const ImageMenuModal: React.FC<ImageMenuModalProps> = ({
	opened,
	deleteBtnOn,
	onUploadClick,
	onNewBlank,
	onOpenHistory,
	onClear,
	onSave,
	onShare,
	onToggleDeleteBtn,
}) => {
	if (!opened) return null;

	return (
		<div id="image-menu" className="popup" onClick={(e) => e.stopPropagation()}>
			<button id="btn-upload" type="button" className="c-indigo" onClick={onUploadClick}>
				<FolderOpen className="icon" />
				<span style={{ color: 'var(--text)' }}>Завантажити</span>
			</button>
			<button id="btn-new-blank" type="button" className="c-indigo-l" onClick={onNewBlank}>
				<FilePlus className="icon" />
				<span>Новий білий аркуш</span>
			</button>
			<button id="btn-history" type="button" className="c-indigo" onClick={onOpenHistory}>
				<Clock className="icon" />
				<span style={{ color: 'var(--text)' }}>Історія проектів</span>
			</button>
			<button id="btn-clear" type="button" className="c-red" onClick={onClear}>
				<Trash2 className="icon" />
				<span>Очистити</span>
			</button>
			<button id="btn-save" type="button" className="c-green" onClick={onSave}>
				<Save className="icon" />
				<span>Зберегти</span>
			</button>
			<button id="btn-share" type="button" className="c-sky" onClick={onShare}>
				<Share2 className="icon" />
				<span>Поділитися</span>
			</button>
			<button id="btn-toggle-delete" type="button" className="c-red" onClick={onToggleDeleteBtn}>
				<Trash2 className="icon" />
				<span style={{ color: 'var(--text)', flex: 1 }}>Кошик на штампі</span>
				<span id="sw-delete" className={`sw ${deleteBtnOn ? 'on' : ''}`} />
			</button>
		</div>
	);
};

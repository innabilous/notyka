'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Tag, X } from 'lucide-react';

interface CustomStampModalProps {
	opened: boolean;
	onClose: () => void;
	onAddStamp: (text: string) => void;
}

export const CustomStampModal: React.FC<CustomStampModalProps> = ({
	opened,
	onClose,
	onAddStamp,
}) => {
	const [text, setText] = useState('');
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (opened) {
			setText('');
			// Гарантований автофокус інпуту після рендеру
			const timer = setTimeout(() => {
				inputRef.current?.focus();
			}, 50);
			return () => clearTimeout(timer);
		}
	}, [opened]);

	if (!opened) return null;

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = text.trim();
		if (!trimmed) return;
		onAddStamp(trimmed);
		onClose();
	};

	return (
		<div
			style={{
				position: 'fixed',
				inset: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.72)',
				backdropFilter: 'blur(8px)',
				WebkitBackdropFilter: 'blur(8px)',
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
					borderRadius: '1.25rem',
					boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.7)',
					width: 'min(380px, 100%)',
					display: 'flex',
					flexDirection: 'column',
					overflow: 'hidden',
				}}
				onClick={(e) => e.stopPropagation()}
			>
				{/* Шапка модалки */}
				<div
					style={{
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '0.85rem 1.15rem',
						borderBottom: '1px solid var(--line)',
					}}
				>
					<div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
						<Tag className="icon" style={{ color: 'var(--text-secondary)' }} />
						<span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>
							Додати власний штамп
						</span>
					</div>
					<button
						type="button"
						style={{
							background: 'transparent',
							border: 'none',
							color: 'var(--muted)',
							cursor: 'pointer',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
							padding: '0.2rem',
							borderRadius: '0.25rem',
						}}
						onClick={onClose}
						aria-label="Закрити"
					>
						<X className="icon" />
					</button>
				</div>

				{/* Тіло форми */}
				<form
					onSubmit={handleSubmit}
					style={{
						padding: '1.15rem',
						display: 'flex',
						flexDirection: 'column',
						gap: '1rem',
					}}
				>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
						<label
							htmlFor="custom-stamp-input"
							style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}
						>
							Текст або позначка:
						</label>
						<input
							ref={inputRef}
							id="custom-stamp-input"
							type="text"
							className="stamp-modal-input"
							placeholder="Наприклад: 1 і, rit., cresc., дихання..."
							value={text}
							onChange={(e) => setText(e.target.value)}
							maxLength={30}
						/>
					</div>

					<div
						style={{
							display: 'flex',
							justifyContent: 'flex-end',
							gap: '0.5rem',
							marginTop: '0.25rem',
						}}
					>
						<button
							type="button"
							className="top-btn"
							style={{
								width: 'auto',
								padding: '0.45rem 1rem',
								borderRadius: '9999px',
								fontSize: '0.85rem',
							}}
							onClick={onClose}
						>
							Скасувати
						</button>

						<button
							type="submit"
							className="btn-primary"
							style={{
								padding: '0.45rem 1.15rem',
								borderRadius: '9999px',
								fontSize: '0.85rem',
								opacity: text.trim() ? 1 : 0.4,
								cursor: text.trim() ? 'pointer' : 'default',
							}}
							disabled={!text.trim()}
						>
							Зберегти
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

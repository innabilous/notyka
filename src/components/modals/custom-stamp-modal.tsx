'use client';

import React, { useEffect, useState } from 'react';
import { Button, Group, Modal, Stack, Text, TextInput } from '@mantine/core';
import { Tag } from 'lucide-react';

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

	useEffect(() => {
		if (opened) {
			setText('');
		}
	}, [opened]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		const trimmed = text.trim();
		if (!trimmed) return;
		onAddStamp(trimmed);
		onClose();
	};

	return (
		<Modal
			opened={opened}
			onClose={onClose}
			title={
				<Group gap="xs">
					<Tag size={18} />
					<Text fw={600} size="sm">
						Додати власний штамп
					</Text>
				</Group>
			}
			size="sm"
			centered
		>
			<form onSubmit={handleSubmit}>
				<Stack gap="md">
					<TextInput
						label="Текст або позначка:"
						placeholder="Наприклад: 1 і, rit., cresc., дихання..."
						value={text}
						onChange={(e) => setText(e.target.value)}
						maxLength={30}
						data-autofocus
					/>
					<Group justify="flex-end" gap="xs">
						<Button variant="default" size="xs" onClick={onClose}>
							Скасувати
						</Button>
						<Button type="submit" size="xs" disabled={!text.trim()}>
							Зберегти
						</Button>
					</Group>
				</Stack>
			</form>
		</Modal>
	);
};

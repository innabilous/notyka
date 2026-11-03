'use client';

import React from 'react';
import { Button, Group } from '@mantine/core';
import { ACCIDENTALS, NOTES } from '@/constants/editor';

interface StampSettingsProps {
	selectedNote: string;
	selectedAccidental: string;
	onSelectNote: (note: string) => void;
	onSelectAccidental: (acc: string) => void;
}

export const StampSettings: React.FC<StampSettingsProps> = ({
	selectedNote,
	selectedAccidental,
	onSelectNote,
	onSelectAccidental,
}) => {
	return (
		<Group
			justify="space-between"
			gap={4}
			wrap="nowrap"
			style={{
				padding: '6px 8px',
				backgroundColor: 'rgba(17, 24, 39, 0.9)',
				borderRadius: 12,
				border: '1px solid rgba(55, 65, 81, 0.6)',
				width: '100%',
				overflowX: 'auto',
			}}
		>
			<Group gap={4} wrap="nowrap" style={{ flex: 1 }}>
				{NOTES.map((note) => {
					const isActive = selectedNote === note;
					return (
						<Button
							key={note}
							size="xs"
							variant={isActive ? 'filled' : 'subtle'}
							color={isActive ? 'indigo.6' : 'gray'}
							onClick={() => onSelectNote(note)}
							style={{
								flex: 1,
								padding: '0 4px',
								height: 32,
								fontSize: 12,
								fontWeight: 700,
								color: isActive ? '#ffffff' : '#d1d5db',
								backgroundColor: isActive ? undefined : 'rgba(31, 41, 55, 0.8)',
							}}
						>
							{note}
						</Button>
					);
				})}
			</Group>

			<div
				style={{
					width: 1,
					height: 20,
					backgroundColor: 'rgba(55, 65, 81, 0.8)',
					flexShrink: 0,
				}}
			/>

			<Group gap={4} wrap="nowrap" style={{ flexShrink: 0 }}>
				{ACCIDENTALS.map((acc) => {
					const isActive = selectedAccidental === acc;
					return (
						<Button
							key={acc}
							size="xs"
							variant={isActive ? 'filled' : 'subtle'}
							color={isActive ? 'indigo.6' : 'gray'}
							onClick={() => onSelectAccidental(acc)}
							style={{
								minWidth: 32,
								height: 32,
								padding: '0 6px',
								fontSize: 14,
								fontWeight: 700,
								color: isActive ? '#ffffff' : '#d1d5db',
								backgroundColor: isActive ? undefined : 'rgba(31, 41, 55, 0.8)',
							}}
						>
							{acc}
						</Button>
					);
				})}
			</Group>
		</Group>
	);
};

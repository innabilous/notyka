'use client';

import React from 'react';
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
		<div id="stamp-settings">
			<div id="note-selector">
				{NOTES.map((note) => (
					<button
						key={note}
						type="button"
						className={`chip note-btn ${selectedNote === note ? 'active' : ''}`}
						onClick={() => onSelectNote(note)}
					>
						{note}
					</button>
				))}
				<div className="sep" />
				{ACCIDENTALS.map((acc) => (
					<button
						key={acc}
						type="button"
						className={`chip accidental-btn ${selectedAccidental === acc ? 'active' : ''}`}
						onClick={() => onSelectAccidental(acc)}
					>
						{acc}
					</button>
				))}
			</div>
		</div>
	);
};

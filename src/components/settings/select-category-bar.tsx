'use client';

import React from 'react';
import { SegmentedControl } from '@mantine/core';
import { SELECT_FILTER_CATEGORIES } from '@/constants/editor';
import { SelectFilterCategory, StampCategory } from '@/types/editor';

interface SelectCategoryBarProps {
	category: SelectFilterCategory;
	availableCategories?: StampCategory[];
	onChangeCategory: (cat: SelectFilterCategory) => void;
}

export const SelectCategoryBar: React.FC<SelectCategoryBarProps> = ({
	category,
	availableCategories = [],
	onChangeCategory,
}) => {
	const data = SELECT_FILTER_CATEGORIES.map((c) => ({
		label: c.label,
		value: c.id,
		disabled: c.id !== 'all' && !availableCategories.includes(c.id as StampCategory),
	}));

	return (
		<div id="select-category-settings" aria-label="Фільтр категорій для виділення">
			<div className="stamp-category-tabs">
				<SegmentedControl
					fullWidth
					size="xs"
					radius="xl"
					withItemsBorders={false}
					value={category}
					onChange={(val) => onChangeCategory(val as SelectFilterCategory)}
					data={data}
					classNames={{
						root: 'stamp-segmented-root',
						indicator: 'stamp-segmented-indicator',
						label: 'stamp-segmented-label',
					}}
				/>
			</div>
		</div>
	);
};


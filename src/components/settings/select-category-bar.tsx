'use client';

import React, { useMemo } from 'react';
import { Box, SegmentedControl } from '@mantine/core';
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
	const availableSet = useMemo(() => new Set(availableCategories), [availableCategories]);
	const data = useMemo(
		() =>
			SELECT_FILTER_CATEGORIES.map((c) => ({
				label: c.label,
				value: c.id,
				disabled: c.id !== 'all' && !availableSet.has(c.id as StampCategory),
			})),
		[availableSet],
	);

	return (
		<Box id="select-category-settings" aria-label="Фільтр категорій для виділення">
			<Box className="stamp-category-tabs">
				<SegmentedControl
					fullWidth
					size="xs"
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
			</Box>
		</Box>
	);
};


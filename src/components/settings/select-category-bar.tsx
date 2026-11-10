'use client';

import React, { useMemo } from 'react';
import { Box, SegmentedControl } from '@mantine/core';
import { SELECT_FILTER_CATEGORIES } from '@/constants/editor';
import { SelectFilterCategory, StampCategory, isSelectFilterCategory } from '@/types/editor';
import classes from './select-category-bar.module.css';

interface SelectCategoryBarProps {
	category: SelectFilterCategory;
	availableCategories?: StampCategory[];
	onChangeCategory: (cat: SelectFilterCategory) => void;
}

export function SelectCategoryBar({
	category,
	availableCategories = [],
	onChangeCategory,
}: SelectCategoryBarProps) {
	const availableSet = useMemo(() => new Set(availableCategories), [availableCategories]);
	const data = useMemo(
		() =>
			SELECT_FILTER_CATEGORIES.map((c) => ({
				label: c.label,
				value: c.id,
				disabled: c.id !== 'all' && !availableSet.has(c.id),
			})),
		[availableSet],
	);

	return (
		<Box
			id="select-category-settings"
			className={classes.root}
			aria-label="Фільтр категорій для виділення"
		>
			<Box className="stamp-category-tabs">
				<SegmentedControl
					fullWidth
					size="xs"
					withItemsBorders={false}
					value={category}
					onChange={(val) => {
						if (isSelectFilterCategory(val)) onChangeCategory(val);
					}}
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
}

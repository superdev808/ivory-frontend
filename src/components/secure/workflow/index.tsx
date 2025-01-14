'use client';
import { use, useEffect, useState } from 'react';
import WorkflowSelectionMenuComponent from './SelectionMenu';

import WorkflowComponent from './Workflow';
import useWorkflowLoadData from '@/hooks/useWorkflowLoadData';
import { useAppSelector } from '@/redux/hooks/hooks';
import { useDispatch } from 'react-redux';
import { setSelectedId, setLoading } from '@/redux/slices/workflows/workflowSelectionSlice';

const WorkflowsComponent = () => {
	const { route } = useAppSelector((state) => state.route);	
	
	
	
	const dispatch = useDispatch();
	useWorkflowLoadData();

	const { menuItems, menuQuestions } = useAppSelector((state) => state.workflows);
	const { selectedId, isLoading } = useAppSelector((state) => state.workflowSelection);

	const [renderComponent, setRenderComponent] = useState<any>(null);

	useEffect(() => {
		if (menuItems.length == 0 || menuQuestions.length == 0) return;

		if (!route) {
			dispatch(setLoading(false));
			dispatch(setSelectedId(0));
			return;
		}

		const currentSelection = route[route.length - 1];
		const flow = menuItems.find(
			(item) => String(currentSelection) == String(item.id) && String(item.hierarchy) == String(route.slice(0, -1)) && item.workflow_id
		);
		if (flow) {
			dispatch(setSelectedId(flow.id));
		} else {
			dispatch(setSelectedId(0));
		}
		dispatch(setLoading(false));
	}, [menuItems, menuQuestions]); // eslint-disable-line react-hooks/exhaustive-deps

	useEffect(() => {
		if (isLoading) return;
		if (Number(selectedId) > 0) {
			setRenderComponent(<WorkflowComponent />);
		} else if (Number(selectedId) === 0) {
			setRenderComponent(<WorkflowSelectionMenuComponent/>);
		}
	}, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

	return <>{renderComponent}</>;
};

export default WorkflowsComponent;

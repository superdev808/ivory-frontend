'use client';

import styles from './Guide.module.scss';

import GuideHeader from './Header';
import GuideText from './Text';
import Flow from './flow';
import useSelectGuide from '@/hooks/useSelectGuide';

import { Splitter, SplitterPanel } from 'primereact/splitter';

export default function GuideComponent() {
	useSelectGuide();
	return (
		<div className={styles.container}>
			<Splitter className="w-full border-0 overflow-hidden">
				<SplitterPanel size={25} minSize={20} className='h-full'>
					<GuideText />
				
				</SplitterPanel>
				<SplitterPanel
					className=""
					size={75}>
					<div className="flex flex-column">
						<div className="px-6 py-4 bg-gray-100">
							<GuideHeader />
						</div>
						<div>
							{/* <Flow></Flow> */}
						</div>
					</div>
				</SplitterPanel>
			</Splitter>
		</div>
	);
}

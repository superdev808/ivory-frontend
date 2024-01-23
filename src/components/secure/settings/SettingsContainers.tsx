'use client';
import styles from '@/components/secure/settings/Settings.module.scss';
import classNames from 'classnames/bind';
import SettingsMenu from './SettingsMenu';
import SettingsUserInfoForm from './SettingsUserInfoForm';
import { useState } from 'react';
import SettingsUserSecurityForm from './SettingsUserSecurityForm';
import SettingsUserOrgForm from './SettingsUserOrgForm';
const cx = classNames.bind(styles);

export default function SettingsContainers() {
	const menuItems = [
		{id:'profile', label: 'Profile', icon: 'pi pi-fw pi-user' },
		{id:'organization',  label: 'Organization', icon: 'pi pi-fw pi-globe' },
		{id:'password',  label: 'Password & Security', icon: 'pi pi-fw pi-lock' },
	];
	const [currentSetting, setCurrentSetting] = useState(menuItems[0].id);

	const onSelect = (item) => {
		
		setCurrentSetting(item.id);
	}

	return (
		<>
			<div
				id="container"
				className="nav-offset container flex justify-content-center">
				<div
					id="wrapper"
					className={cx('settings', 'wrapper grid m-0 my-4')}>
					<div className={cx('col-3 p-4 bg-white  border-right-1		')}>
						<SettingsMenu active={currentSetting} menuItems={menuItems} onSelect={onSelect}/>
					</div>
					<div className="col ml-6 p-4  bg-white border-round-xl	">
						{currentSetting === menuItems[0].id && <SettingsUserInfoForm />}
						{currentSetting === menuItems[1].id && <SettingsUserOrgForm />}
						{currentSetting === menuItems[2].id && <SettingsUserSecurityForm />}
					</div>
				</div>
			</div>
		</>
	);
}

'use client';

import React, { PropsWithChildren, useEffect } from 'react';
import Navigation from '@/components/navigation';
import './globals.scss';
import { Providers } from '@/redux/provider';

import '../styles/theme/custom/theme.css'; //theme
import 'primereact/resources/primereact.min.css'; //core css
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';

import AuthProvider from './provider';

import { usePathname } from 'next/navigation';
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: PropsWithChildren) {
	const [accessToken, setAccessToken] = React.useState(null);
	const activePath = usePathname();

	useEffect(() => {
		async function getSession() {
			try {
				const response = await fetch('/api/auth/session', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
				});
				const data = await response.json();
				if (!response.ok) {
					throw new Error(data.error);
				}
				setAccessToken(data.session.accessToken || null);
			} catch (error: any) {
				return null;
			}
		}
		getSession();
	}, []);

	return (
		<html>
			<head></head>
			<body>
				<Providers>
					<AuthProvider accessToken={accessToken}>
						{activePath !== '/login/' ? <Navigation /> : null}

						<div
							className="container z-1"
							style={{ overflowX: 'hidden' }}>
							{children}
						</div>
					</AuthProvider>
				</Providers>
			</body>
		</html>
	);
}

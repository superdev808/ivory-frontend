export enum PUBLIC_ROUTES {
	HOME = '/',
	CONTACT = '/contact/',
	ABOUT = '/about/',
	PRODUCT = '/product/',
	FORBIDDEN = '/error/403/',
}

export enum PUBLIC_AUTH_ROUTES {
	LOGIN = '/login/',
	REGISTER = '/register/',
	VERIFY = '/verify/',
	RESET_PASSWORD = '/reset-password/',
	FORGOT_PASSWORD = '/forgot-password/',
}

export enum PRIVATE_ROUTES {
	HOME = '/home/',
	DASHBOARD = '/dashboard/',
	CALCULATORS = '/calculators/',
	SETTINGS = '/settings/',
	HELP = '/help/',
	ADMIN = '/admin/',
}

export const REDIRECT_TO_AUTH = PRIVATE_ROUTES.CALCULATORS;
export const REDIRECT_TO_UNAUTH = PUBLIC_AUTH_ROUTES.LOGIN;
export const BYPASS_AUTH_ROUTES = [PUBLIC_AUTH_ROUTES.RESET_PASSWORD, PUBLIC_ROUTES.FORBIDDEN];

export const ADMIN_ROUTES = [PRIVATE_ROUTES.ADMIN];

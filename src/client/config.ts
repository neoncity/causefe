import { Env } from '@neoncity/common-js'


export const ENV:Env = parseInt('{{{ ENV }}}');
export const AUTH0_CLIENT_ID: string = '{{{ AUTH0_CLIENT_ID }}}';
export const AUTH0_DOMAIN: string = '{{{ AUTH0_DOMAIN }}}';
export const AUTH0_CALLBACK_URI: string = '{{{ AUTH0_CALLBACK_URI }}}';
export const FILESTACK_KEY: string = '{{{ FILESTACK_KEY }}}';
export const IDENTITY_SERVICE_EXTERNAL_HOST: string = '{{{ IDENTITY_SERVICE_EXTERNAL_HOST }}}';
export const CORE_SERVICE_EXTERNAL_HOST: string = '{{{ CORE_SERVICE_EXTERNAL_HOST }}}';
export const FACEBOOK_APP_ID: string = '{{{ FACEBOOK_APP_ID }}}';
export const LOGOUT_ROUTE: string = '{{{ LOGOUT_ROUTE }}}';

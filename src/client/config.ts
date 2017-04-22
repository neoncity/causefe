import { Env } from '@neoncity/common-js/env'


export const ENV:Env = parseInt('{{{ ENV }}}');
export const AUTH0_CLIENT_ID: string = '{{{ AUTH0_CLIENT_ID }}}';
export const AUTH0_DOMAIN: string = '{{{ AUTH0_DOMAIN }}}';
export const AUTH0_CALLBACK_URI: string = '{{{ AUTH0_CALLBACK_URI }}}';
export const FILESTACK_KEY: string = '{{{ FILESTACK_KEY }}}';
export const IDENTITY_SERVICE_HOST: string = '{{{ IDENTITY_SERVICE_HOST }}}';
export const CORE_SERVICE_HOST: string = '{{{ CORE_SERVICE_HOST }}}';

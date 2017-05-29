import * as r from 'raynor'
import { ExtractError, MarshalFrom, MarshalWith } from 'raynor'


class AllowedRoutesMarshaller extends r.AbsolutePathMarshaller {
    filter(path: string): string {
	if (!(path == '/'
	      || path.indexOf('/c/') == 0
	      || path.indexOf('/admin') == 0)) {
	    throw new ExtractError('Expected one of our paths');
	}

	return path;
    }
}


export class PostLoginRedirectInfo {
    @MarshalWith(AllowedRoutesMarshaller)
    path: string;

    constructor(path: string) {
        this.path = path;
    }
}


export class PostLoginRedirectInfoMarshaller extends r.BaseStringMarshaller<PostLoginRedirectInfo> {
    private static readonly _objectMarshaller = new (MarshalFrom(PostLoginRedirectInfo))();

    build(a: string): PostLoginRedirectInfo {
	try {
	    const redirectInfoSer = decodeURIComponent(a);
	    const redirectInfoRaw = JSON.parse(redirectInfoSer);
	    return PostLoginRedirectInfoMarshaller._objectMarshaller.extract(redirectInfoRaw);
	} catch (e) {
	    throw new ExtractError(`Could not build redirect info "${e.toString()}"`);
	}
    }

    unbuild(redirectInfo: PostLoginRedirectInfo) {
	const redirectInfoRaw = PostLoginRedirectInfoMarshaller._objectMarshaller.pack(redirectInfo);
	const redirectInfoSer = JSON.stringify(redirectInfoRaw);
	return encodeURIComponent(redirectInfoSer);
    }
}
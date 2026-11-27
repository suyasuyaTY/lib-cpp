// サイドバーの各ページ名の前に確認状態の絵文字を付ける
import { defineRouteMiddleware, type StarlightRouteData } from '@astrojs/starlight/route-data';
import { docHref, getTagIndex } from './lib/tags';
import { statusIcon } from './lib/status';

type Entry = StarlightRouteData['sidebar'][number];

export const onRequest = defineRouteMiddleware(async (context) => {
	const { byId } = await getTagIndex();
	const iconOf = new Map([...byId.values()].map((d) => [docHref(d.id), statusIcon(d)]));

	const visit = (entries: Entry[]) => {
		for (const e of entries) {
			if (e.type === 'group') visit(e.entries);
			else {
				const icon = iconOf.get(e.href);
				if (icon) e.label = `${icon} ${e.label}`;
			}
		}
	};
	visit(context.locals.starlightRoute.sidebar);
});

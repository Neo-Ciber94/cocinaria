import { getContext, setContext } from 'svelte';

const SVELTE_SEO_BASE_TITLE = Symbol('SVELTE_SEO_BASE_TITLE');

export function setSeoBaseTitle(title: string) {
	return setContext(SVELTE_SEO_BASE_TITLE, title);
}

export function useSeoBaseTitle() {
	return getContext(SVELTE_SEO_BASE_TITLE) as ReturnType<typeof setSeoBaseTitle> | undefined;
}

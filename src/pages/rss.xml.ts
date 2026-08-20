import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '../lib/site';
import { sortByDate, postPath } from '../lib/blog';

export async function GET(context: APIContext) {
  const posts = sortByDate(await getCollection('blog', p => !p.data.draft));

  return rss({
    title: `${SITE.name} — Blog`,
    description:
      'Practical guides on Airtable, workflow automation and the systems that keep small teams from doing everything by hand.',
    site: context.site!,
    // Deliberately no `content:encoded`. The bodies reference their images as
    // relative paths that Astro rewrites to hashed /_astro/ URLs at build — a
    // feed reader has no way to resolve them, so a full-text feed would ship 61
    // articles full of broken images and re-serialise 82,000 words every build.
    items: posts.map(post => ({
      title: post.data.title,
      description: post.data.description,
      link: `/${postPath(post.id)}`,
      pubDate: post.data.published,
    })),
    customData: '<language>en-us</language>',
  });
}

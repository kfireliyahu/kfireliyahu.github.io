import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

/**
 * Files in public/, by the path the page uses (e.g. /images/tetra-icon.svg). Resolved from the
 * project root, where `astro dev` and `astro build` both run: once bundled for a build,
 * import.meta.url points into the build output, where public/ is not, and every image would
 * quietly drop out of the page.
 */
const onDisk = (src: string) => join(process.cwd(), 'public', src);

/** True when the file is in public/. */
export const inPublic = (src: string | null | undefined): src is string => !!src && existsSync(onDisk(src));

/** The file's text. */
export const readPublic = (src: string) => readFileSync(onDisk(src), 'utf8');

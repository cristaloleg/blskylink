/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		async function handleHome(): Promise<Response> {
			const html = `<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<meta name="color-scheme" content="light dark" />
					<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css" />
					<title>BlueSky Link</title>
				</head>
				<body>
					<main class="container">
						<h1>BlueSky Link</h1>
			
						<p>The only idea for this website is to convert the long BlusSky profile URL to something shorter.</p>

						
						<p>
						From
						<a href="https://bsky.app/profile/go-perf.bsky.social">https://bsky.app/profile/go-perf.bsky.social</a>
						</p>
						<p>To <a href="https://blskyl.ink/go-perf">https://blskyl.ink/go-perf</a></p>
						
						<p>
						Just add your nickname after "https://blskyl.ink/" in the address bar and voila!
						</p>

						<p>
							<mark>Not affiliated with BlueSky.</mark>
						</p>
					</main>
			
					<footer class="container">
					Author: Oleg Kovalov <a href="https://olegk.dev/bluesky-link">https://olegk.dev/bluesky-link</a> / Help: <a href="mailto:help@blskyl.ink">help@blskyl.ink</a>
					</footer>
				</body>
			</html>`;

			return new Response(html, {
				headers: {
					'content-type': 'text/html;charset=UTF-8',
				},
			});
		}

		async function handleText(text: string): Promise<Response> {
			return new Response(text, {
				headers: {
					'content-type': 'text/plain;charset=UTF-8',
				},
			});
		}

		async function handle404(): Promise<Response> {
			const html = `<!DOCTYPE html>
			<html lang="en">
				<head>
					<meta charset="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<meta name="color-scheme" content="light dark" />
					<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@picocss/pico@2/css/pico.min.css" />
					<title>BlueSky Link</title>
				</head>
				<body>
					<main class="container">
						<h3>Profile or page not found</h3>
					</main>
				</body>
			</html>`;

			return new Response(html, {
				status: 404,
				headers: {
					'content-type': 'text/html;charset=UTF-8',
				},
			});
		}

		async function handleGET(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
			const url = new URL(request.url);
			const { pathname } = url;
			const profile = pathname.substring(1);

			if (profile === '') {
				return handleHome();
			}

			if (profile === 'robots.txt') {
				const text = `User-Agent: *
Disallow: /
`;

				return handleText(text);
			}

			if (profile === 'security.txt') {
				const text = `Contact: mailto:security@blskyl.ink
Preferred-Languages: en
`;

				return handleText(text);
			}

			if (profile.includes('/')) {
				return handle404();
			}

			const base = 'https://bsky.app/profile/';
			const statusCode = 301;

			if (!profile.includes('.')) {
				const destinationURL = `${base}${profile}.bsky.social`;
				return Response.redirect(destinationURL, statusCode);
			}

			const apiURL = 'https://public.api.bsky.app/xrpc/app.bsky.actor.getProfile?actor=';
			const responseAPI = await fetch(`${apiURL}${profile}`);

			if (responseAPI.status != 200) {
				return handle404();
			}

			const destinationURL = `${base}${profile}`;
			return Response.redirect(destinationURL, statusCode);
		}

		if (request.method === 'GET' || request.method === 'OPTIONS') {
			return handleGET(request, env, ctx);
		}
		return new Response('Method not allowed', { status: 405 });
	},
};

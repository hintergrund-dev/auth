export function getComponent(element, params = '') {
	let template = `
<!doctype html>
<html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>hintergrund ${element.toUpperCase()} component</title>
        <style>body{margin:0}</style>
    </head>
    <body>
        <hg-${element} ${params}></hg-${element}>
        <script type="module" src="https://cdn.jsdelivr.net/npm/@hintergrund/components@0.0.1-next.1/dist/${element}/index.js"></script>
    </body>
  </html>
  `;
	return new Response(template, {
		status: 200,
		headers: {
			'Content-Type': 'text/html'
		}
	});
}

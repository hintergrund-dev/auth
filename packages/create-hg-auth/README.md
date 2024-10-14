# create-hintergrund

A CLI for creating new [hintergrund CMS](https://hintergrund.dev) projects. Just run...

```bash
npm create hintergrund@latest
```

...and follow the prompts.

## API

You can also use `create-hintergrund` programmatically:

```js
import { create } from 'create-hintergrund';

await create('my-new-app', {
	name: 'my-new-app',
	template: 'default' // or 'skeleton' or 'skeletonlib'
});
```

## License

[AGPL-3.0](../../LICENSE).

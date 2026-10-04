# Avatar Editor

Standalone static editor, preserving the supplied native loader, character, controls, animations, sound and avatar preview.

## Publish with GitHub Pages

1. Upload every file in this folder to a repository, including assets and .nojekyll.
2. In Settings → Pages, publish the repository branch and root folder.
3. Open the published HTTPS URL. Repository subpaths are supported; no backend, build step or API key is required.

The first load needs the hosted files. All application assets are included locally; it makes no external service requests. Opening index.html directly as file:// is unsupported because browsers restrict ES modules and WebGL asset requests.

## Use

The original loading screen opens the editor directly. Choose options or Randomize, then Save. In My Avatar Preview select full view or close-up and a background. Download saves matching PNG and TXT files. If the browser asks to allow multiple downloads, allow them for this site. Both files have the same name stem. The TXT includes all 12 native fields, option IDs, model nodes, colors, exact serialized configuration, background and framing. It can be used to reconstruct the same avatar.

There is no game, team view or back navigation in this editor. No avatar data is sent to a server.

The original game has 30 unique character slots, archived separately for a future friends integration. This editor and its TXT format have no 30-person limit and do not assign a person, name or slot. Send both downloaded files together with the person’s name and details when that later integration is requested.

## Reproduce from the working repository

Run node scripts/build-xox-avatar-editor.mjs. Original reference files and recovered-asset provenance are under reference/fun-xox/.

**Image Generator**

This small Express + TypeScript service resizes images on demand and caches thumbnails.

**Scripts**

- **install:** Run dependencies: `npm install`
- **start:** Starts the dev server with `nodemon` and `ts-node`: `npm run start` (default port `8000`, set `PORT` to override)
- **build:** Compile TypeScript to `dist`: `npm run build` (`tsc`)
- **test:** Build and run Jasmine specs: `npm run test`
- **lint:** Run ESLint on source: `npm run lint`
- **prettier:** Run Prettier: `npm run prettier`

**Endpoints**

- **GET** `/health` — returns JSON health check: `{"status":"OK"}`
- **GET** `/resize` — resize an image and return the thumbnail (also caches the result)
  - Query parameters:
    - `filename` (required): image file name (example: `test.jpg`). Place images in `src/images/` when running in dev.
    - `width` (required): desired width in pixels
    - `height` (required): desired height in pixels
  - Example (browser):
    - `http://localhost:8000/resize?filename=test.jpg&width=200&height=200`
  - Example (curl):
    - `curl -o thumb.jpg "http://localhost:8000/resize?filename=test.jpg&width=200&height=200"`

**Cache behavior (what the reviewer should verify)**

- Thumbnails are written to the `src/cache/` directory when running the app from source (dev flow).
- To verify caching behavior:
  1. Start the dev server (uses `src/` assets):

```bash
npm install
PORT=8000 npm run start
```

2. Ensure an original image exists (the repo includes `src/images/test.jpg`). To use `cat.jpg` place `cat.jpg` into `src/images/`.

3. Request a thumbnail (first request should create it):

```bash
curl -v -o thumb.jpg "http://localhost:8000/resize?filename=test.jpg&width=250&height=250"
```

4. Confirm the cached thumbnail exists:

```bash
ls -l src/cache
# you should see a file like: test_250x250.jpg
```

5. Delete the cached thumbnail and re-request to see it recreated:

```bash
rm src/cache/test_250x250.jpg
curl -v -o thumb2.jpg "http://localhost:8000/resize?filename=test.jpg&width=250&height=250"
ls -l src/cache
# the thumbnail should be recreated
```

6. Re-request the same endpoint again (without deleting) — the server will send the cached file; it should not re-create a new file (mtime should be unchanged):

```bash
curl -v -o thumb3.jpg "http://localhost:8000/resize?filename=test.jpg&width=250&height=250"
ls -l src/cache/test_250x250.jpg
```

**Notes for running the compiled build**

- If you run the compiled code (`node dist/index.js`) after `npm run build`, the compiled app will look for static assets under `dist/images` and `dist/cache`. TypeScript does not copy static assets automatically, so either:
  - Copy the images and (optional) cache directory into `dist` before running:

```bash
npm run build
cp -R src/images dist/images
mkdir -p dist/cache
node dist/index.js
```

- Or run the app in dev mode with `npm run start` (nodemon + ts-node) which uses `src/images` and `src/cache` directly.

**Other functionality / implementation notes**

- The service uses `sharp` to perform resizing and writes thumbnails to `cache` with the naming pattern: `{basename}_{width}x{height}{ext}` (e.g., `test_200x200.jpg`).
- The code returns HTTP 404 when the requested original image is not found. If you intend to use `cat.jpg`, add that file to `src/images/`.
- The resize endpoint performs minimal parameter presence checks; ensure `filename`, `width`, and `height` are supplied and include the extension (for example `test.jpg`).

**Troubleshooting**

- If you get `{"error":"Image file not found"}`:
  - Confirm the requested `filename` exists in `src/images/` when using `npm run start`.
  - If you ran `npm run build` and started `node dist/index.js`, ensure you copied `src/images` to `dist/images` as shown above.
- To run the test suite:

```bash
npm run test
```

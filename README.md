# Share-link site

These files belong in the root of the `skylightlim/skylightlim.github.io` repository, which GitHub
Pages serves at `https://skylightlim.github.io/`:

- `city/` is the page a share link opens when Skyline QR is not installed: the link's QR code, the
  city's code and a link to the app.
- `.well-known/assetlinks.json` lets Android open share links straight in the app. It lists the
  release key's fingerprint (and the local debug keys', for testing: Gradle here signs debug builds
  with ~/.config/.android/debug.keystore). App Links verify against the
  domain root, which is why this cannot live in the project's own Pages site.
- `.nojekyll` stops GitHub Pages from hiding the `.well-known` folder.

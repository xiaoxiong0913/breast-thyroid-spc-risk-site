# Render Deployment Notes

This directory is the public deployment candidate for the breast-to-thyroid SPC manuscript web showcase.

Deployment target:

- Render Static Site
- Suggested repo name: `breast-thyroid-spc-risk-site`
- Suggested Render service name: `breast-thyroid-spc-risk-site`

Contents:

- `index.html` and `assets/`: static site payload
- `render.yaml`: Render Blueprint for a static site

Known scope:

- This is a manuscript-facing static review site.
- It does not expose a prediction API.
- The locked truth package did not provide a public locked runtime bundle, so the deployment must remain described as a public manuscript web showcase rather than a live bedside calculator.

Next steps after authentication:

1. Log into GitHub on this machine: `gh auth login`
2. Create a repo from this folder and push it.
3. In Render, create a new Blueprint or Static Site from that repo.
4. After Render assigns a public URL, update:
   - `E:\Codex\projects\breast_thyroid_spc_rebuild_20260403_0914\投稿核心文件\投稿文件\Supplementary\Web Calculator\deployment_record.json`
   - `E:\Codex\projects\breast_thyroid_spc_rebuild_20260403_0914\投稿核心文件\投稿文件\Supplementary\Web Calculator\PUBLIC_WEB_LINK.md`
   - the workspace copies under `output/web/`

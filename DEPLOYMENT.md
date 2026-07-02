# Deployment: S3 + CloudFront via GitHub Actions

This site builds to plain static files (`dist/`) and is hosted on Amazon S3
behind a CloudFront CDN, deployed automatically by GitHub Actions on every push
to `main`.

You can develop and preview the whole site locally **without any of this** (see
[README.md](README.md)). Come back here when you're ready to modify the
infrastructure or understand how the pipeline works.

---

## Architecture

```
push to main ──▶ GitHub Actions ──▶ npm run build ──▶ aws s3 sync dist/ ──▶ S3 bucket
                       │                                                          │
                  (OIDC, no keys)                                                 ▼
                                                                      CloudFront CDN
                                                                      + cache invalidation
                                                                             │
                                                                             ▼
                                                               https://emsplc.mrswebber.com
```

The workflow lives in [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

---

## Provisioned resources

All resources were created from [infra/cloudformation.yaml](infra/cloudformation.yaml),
stack **`emsplc-site`** in **`us-east-1`**.

| Resource | Value |
|---|---|
| **Live URL** | https://emsplc.mrswebber.com |
| **S3 bucket** | `emsplc-mrswebber-com` (us-east-1, private, OAC-only access) |
| **CloudFront distribution ID** | `E3HAA5I4NCM7B3` |
| **CloudFront domain** | `d3t1ehp1u8tqjl.cloudfront.net` |
| **ACM certificate** | `arn:aws:acm:us-east-1:020417111620:certificate/399d75a9-57ef-4e9f-9cb8-edc9eae564e7` |
| **IAM deploy role** | `arn:aws:iam::020417111620:role/emsplc-github-deploy` |
| **OIDC provider** | `arn:aws:iam::020417111620:oidc-provider/token.actions.githubusercontent.com` |
| **Route53 zone** | `mrswebber.com` (`Z00087662BKN37H58E2QA`) |
| **DNS records** | A + AAAA aliases → CloudFront |

GitHub repo settings (Settings → Secrets and variables → Actions):

| Type | Name | Value |
|---|---|---|
| Variable | `AWS_REGION` | `us-east-1` |
| Variable | `S3_BUCKET` | `emsplc-mrswebber-com` |
| Variable | `CLOUDFRONT_DISTRIBUTION_ID` | `E3HAA5I4NCM7B3` |
| Secret | `AWS_ROLE_ARN` | `arn:aws:iam::020417111620:role/emsplc-github-deploy` |

---

## Security posture

- **S3 is fully private.** Block Public Access is on for all four settings.
  The bucket policy allows `s3:GetObject` to the CloudFront service principal
  only, conditioned on the exact distribution ARN (OAC).
- **OIDC keyless auth.** GitHub Actions assumes the deploy role via OIDC —
  no long-lived AWS keys are stored anywhere.
- **Main-branch-only trust.** The IAM trust policy is locked to
  `repo:mrs-webber/ems-plt-playbook:ref:refs/heads/main`. PR code and fork
  runs can never assume the role; the workflow has no `pull_request` trigger.
- **Least-privilege deploy role.** The role can only: list the bucket, put/delete
  objects, and create a CloudFront invalidation. Nothing else.
- **Security response headers** (via CloudFront ResponseHeadersPolicy):
  - `Strict-Transport-Security` — 2-year max-age, includeSubDomains, preload
  - `Content-Security-Policy` — locked to `'self'` (no third-party asset loads)
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - CORS scoped to the site origin
- **TLS 1.2+ only** (TLSv1.2_2021 security policy).

---

## How deploys work

1. Push to `main` triggers `.github/workflows/deploy.yml`.
2. The workflow checks out the repo, builds the site (`npm run build`), and
   authenticates to AWS via OIDC (no keys required).
3. Assets are synced in two passes with appropriate cache headers:
   - `_astro/*` (content-hashed): `max-age=31536000, immutable`
   - Everything else (HTML): `max-age=0, must-revalidate`
4. A CloudFront invalidation (`/*`) flushes the cache so users see the new
   content immediately.

---

## Updating infrastructure

The CloudFormation template at [infra/cloudformation.yaml](infra/cloudformation.yaml)
is the single source of truth for all AWS resources. To make changes:

```bash
# Edit infra/cloudformation.yaml, then:
aws cloudformation deploy \
  --stack-name emsplc-site \
  --region us-east-1 \
  --template-file infra/cloudformation.yaml \
  --capabilities CAPABILITY_NAMED_IAM
```

---

## Manual deploy (emergency)

If you need to deploy by hand instead of via GitHub:

```bash
npm run build
aws s3 sync dist/ s3://emsplc-mrswebber-com/ \
  --delete \
  --exclude "_astro/*" \
  --cache-control "public,max-age=0,must-revalidate"
aws s3 sync dist/ s3://emsplc-mrswebber-com/ \
  --delete \
  --exclude "*" --include "_astro/*" \
  --cache-control "public,max-age=31536000,immutable"
aws cloudfront create-invalidation \
  --distribution-id E3HAA5I4NCM7B3 \
  --paths "/*"
```

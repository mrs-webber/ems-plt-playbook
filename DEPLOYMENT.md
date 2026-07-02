# Deployment: S3 + CloudFront via GitHub Actions

This site builds to plain static files (`dist/`) and is designed to be hosted on
Amazon S3 behind a CloudFront CDN, deployed automatically by GitHub Actions on
every push to `main`.

You can develop and preview the whole site locally **without any of this** (see
[README.md](README.md)). Come back here when you're ready to put it online.

---

## Overview

```
push to main ──▶ GitHub Actions ──▶ npm run build ──▶ aws s3 sync dist/ ──▶ S3 bucket
                                                          │
                                                          └─▶ CloudFront invalidation ──▶ live site
```

The workflow lives in [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

---

## One-time AWS setup

### 1. Create the S3 bucket

- Create a bucket (e.g. `ems-plt-playbook`) in your region.
- **Keep "Block all public access" ON.** With CloudFront + Origin Access
  Control (OAC), the bucket stays private and only CloudFront can read it.
- No need to enable "static website hosting" — we serve through CloudFront's
  REST origin.

### 2. Create the CloudFront distribution

- **Origin:** your S3 bucket, using **Origin Access Control (OAC)** (CloudFront
  will give you a bucket policy to paste in — do that so CloudFront can read the
  private bucket).
- **Default root object:** `index.html`
- **Viewer protocol policy:** Redirect HTTP to HTTPS
- After it's created, note the **Distribution ID** (looks like `E1ABCD2EFGHIJ`).

### 3. Add the directory-index CloudFront Function

Because pages build as `/meetings/1/index.html`, requests for `/meetings/1/`
need to be rewritten. Use the provided function:

- CloudFront console → **Functions** → **Create function**
- Paste the contents of [infra/cloudfront-index-rewrite.js](infra/cloudfront-index-rewrite.js)
- **Publish**, then attach it to your distribution's **default behavior** on the
  **Viewer request** event.

### 4. (Optional) Custom domain

- Request an ACM certificate **in us-east-1** for your domain (e.g.
  `plc.yourdistrict.org`).
- Add the domain as an **Alternate domain name (CNAME)** on the distribution and
  select the certificate.
- Point a DNS record (Route 53 alias or a CNAME) at the CloudFront domain.
- Update `site` in [astro.config.mjs](astro.config.mjs) to your final URL.

---

## Connecting GitHub Actions to AWS (keyless OIDC — recommended)

This avoids storing long-lived AWS keys in GitHub.

### 1. Add GitHub as an OIDC identity provider in IAM

- IAM → Identity providers → Add provider → **OpenID Connect**
- Provider URL: `https://token.actions.githubusercontent.com`
- Audience: `sts.amazonaws.com`

### 2. Create an IAM role for the workflow

Trust policy (replace `ACCOUNT_ID` and `OWNER/REPO`):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::ACCOUNT_ID:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": { "token.actions.githubusercontent.com:aud": "sts.amazonaws.com" },
        "StringLike": { "token.actions.githubusercontent.com:sub": "repo:OWNER/REPO:ref:refs/heads/main" }
      }
    }
  ]
}
```

Permissions policy (replace `BUCKET` and the distribution ARN):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::BUCKET"
    },
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::BUCKET/*"
    },
    {
      "Effect": "Allow",
      "Action": ["cloudfront:CreateInvalidation"],
      "Resource": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
    }
  ]
}
```

Copy the role's ARN.

### 3. Add GitHub repo settings

Repo → **Settings** → **Secrets and variables** → **Actions**:

**Secrets:**
- `AWS_ROLE_ARN` — the IAM role ARN from step 2

**Variables:**
- `AWS_REGION` — e.g. `us-east-1`
- `S3_BUCKET` — your bucket name
- `CLOUDFRONT_DISTRIBUTION_ID` — your distribution ID

That's it. Push to `main` and the site deploys.

---

## Alternative: access keys instead of OIDC

If you'd rather not set up OIDC, create an IAM user with the permissions policy
above, generate an access key, and store `AWS_ACCESS_KEY_ID` /
`AWS_SECRET_ACCESS_KEY` as secrets. Then replace the "Configure AWS credentials"
step in the workflow with:

```yaml
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
```

and remove the `id-token: write` permission. OIDC is preferred because there are
no long-lived keys to leak or rotate.

---

## Manual deploy (from your machine)

If you ever want to deploy by hand instead of via GitHub:

```bash
npm run build
aws s3 sync dist/ s3://YOUR_BUCKET/ --delete
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

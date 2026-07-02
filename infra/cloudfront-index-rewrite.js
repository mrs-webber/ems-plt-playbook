// CloudFront Function (viewer request) — "directory index" rewriting.
//
// Astro builds pages as /meetings/1/index.html. When CloudFront's origin is the
// S3 REST endpoint (recommended, private bucket + Origin Access Control), a
// request for /meetings/1/ or /meetings/1 must be rewritten to the index.html
// file. This function handles that.
//
// Setup: CloudFront console → Functions → create a function, paste this in,
// publish, then attach it to your distribution's default behavior on
// "Viewer request". See DEPLOYMENT.md for the full walkthrough.

function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.endsWith('/')) {
    // /meetings/1/  ->  /meetings/1/index.html
    request.uri = uri + 'index.html';
  } else if (!uri.includes('.')) {
    // /meetings/1   ->  /meetings/1/index.html
    request.uri = uri + '/index.html';
  }

  return request;
}

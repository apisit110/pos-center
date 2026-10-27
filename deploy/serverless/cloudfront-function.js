// CloudFront Function (cloudfront-js-2.0), viewer request of the default (S3) behavior.
// The static export of portal writes /login as login.html, so map extensionless paths to their .html file:
//   /                  -> /index.html
//   /merchants/detail  -> /merchants/detail.html   (the ?id= query string is kept by CloudFront)
// Files with an extension (_next/static/*.js, *.txt RSC payloads, favicon.ico) pass through unchanged.
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri === '/' || uri === '') {
    request.uri = '/index.html';
  } else if (uri.endsWith('/')) {
    request.uri = uri.slice(0, -1) + '.html';
  } else if (uri.lastIndexOf('.') < uri.lastIndexOf('/')) {
    request.uri = uri + '.html';
  }

  return request;
}

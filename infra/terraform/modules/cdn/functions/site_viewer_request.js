// Default behavior, viewer-request (cloudfront-js-2.0).
//
// 1. www.<domain> -> 301 to the apex.
// 2. SPA routing: a path whose last segment has no file extension
//    (e.g. /projects/foo, /admin) is a client-side route, so it is rewritten
//    to /index.html. Paths with an extension (assets, robots.txt, sitemap.xml)
//    go to S3 untouched, so a missing asset is a real 404/403, not the SPA.
// CloudFront allows one function per event type per behavior, hence both
// concerns live in this single function.
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (request.headers.host && request.headers.host.value === 'www.${domain_name}') {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: 'https://${domain_name}' + uri }
      }
    };
  }

  if (uri.indexOf('/api/') === 0) {
    return request;
  }

  var lastSegment = uri.substring(uri.lastIndexOf('/') + 1);
  if (lastSegment.indexOf('.') === -1) {
    request.uri = '/index.html';
  }

  return request;
}

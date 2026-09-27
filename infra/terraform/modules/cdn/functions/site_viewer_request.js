// Default behavior, viewer-request (cloudfront-js-2.0).
//
// 1. www.<domain> -> 301 to the apex, keeping the path and query string.
// 2. SPA routing: a path whose last segment has no file extension
//    (e.g. /projects/foo, /admin) is a client-side route, so it is rewritten
//    to /index.html. Paths with an extension (assets, robots.txt, sitemap.xml)
//    go to S3 untouched, so a missing asset is a real 404/403, not the SPA.
// CloudFront allows one function per event type per behavior, hence both
// concerns live in this single function.
// Rebuild "?a=1&b=2" from the event's parsed query string (values arrive
// still URL-encoded, so they are joined back as-is).
function queryString(querystring) {
  var parts = [];
  for (var key in querystring) {
    var entry = querystring[key];
    var values = entry.multiValue || [entry];
    for (var i = 0; i < values.length; i++) {
      parts.push(values[i].value === '' ? key : key + '=' + values[i].value);
    }
  }
  return parts.length ? '?' + parts.join('&') : '';
}

function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (request.headers.host && request.headers.host.value === 'www.${domain_name}') {
    return {
      statusCode: 301,
      statusDescription: 'Moved Permanently',
      headers: {
        location: { value: 'https://${domain_name}' + uri + queryString(request.querystring) }
      }
    };
  }

  var lastSegment = uri.substring(uri.lastIndexOf('/') + 1);
  if (lastSegment.indexOf('.') === -1) {
    request.uri = '/index.html';
  }

  return request;
}

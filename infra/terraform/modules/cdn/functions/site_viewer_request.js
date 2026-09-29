import cf from 'cloudfront';

// The key value store associated with this function (functions.tf); the
// CloudFront docs want this import and handle in the first lines.
var kvs = cf.kvs();

// Default behavior, viewer-request (cloudfront-js-2.0).
//
// 1. www.<domain> -> 301 to the apex, keeping the path and query string.
// 2. Paths whose last segment has a file extension (assets, robots.txt,
//    sitemap.xml) go to S3 untouched, so a missing file is a real 404/403.
// 3. A trailing slash is dropped with a 301 (one canonical URL per page).
// 4. Client-side routes (e.g. /projects/foo, /admin) get the page that
//    `npm run build` pre-rendered with the route's meta tags
//    (/_routes/projects/foo.html) when the associated key value store lists
//    the path, and the SPA shell /index.html otherwise. So content published
//    after the last frontend deploy still works (generic meta only), and a
//    key value store error never becomes an error page.
// CloudFront allows one function per event type per behavior, hence all of
// this lives in this single function. The request's Host header is either
// the apex or www (the distribution's only aliases).

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

function redirect(location) {
  return {
    statusCode: 301,
    statusDescription: 'Moved Permanently',
    headers: { location: { value: location } }
  };
}

// Object key of the pre-rendered page for a path (mirrors routeFile() in
// frontend/scripts/prerender/routes.mjs).
function routeFile(path) {
  return '/_routes' + (path === '/' ? '/index' : path) + '.html';
}

async function pageFor(path) {
  try {
    if (await kvs.exists(path)) {
      return routeFile(path);
    }
  } catch (err) {
    // Fail open: the SPA shell renders the page with generic meta.
  }
  return '/index.html';
}

async function handler(event) {
  var request = event.request;
  var host = request.headers.host ? request.headers.host.value : '';
  var uri = request.uri;

  if (host.indexOf('www.') === 0) {
    return redirect('https://' + host.substring(4) + uri + queryString(request.querystring));
  }

  var lastSegment = uri.substring(uri.lastIndexOf('/') + 1);
  if (lastSegment.indexOf('.') !== -1) {
    return request;
  }

  if (uri.length > 1 && uri.charAt(uri.length - 1) === '/') {
    var trimmed = uri.replace(/\/+$/, '') || '/';
    return redirect('https://' + host + trimmed + queryString(request.querystring));
  }

  request.uri = await pageFor(uri);
  return request;
}

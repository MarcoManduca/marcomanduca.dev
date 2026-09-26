// /api/* behavior, viewer-request (cloudfront-js-2.0).
//
// Pass the real client IP to the backend (used for rate limiting) in
// x-viewer-ip. Any client-supplied value is overwritten, so it cannot be
// spoofed. The Managed-AllViewerExceptHostHeader origin request policy
// forwards the header to API Gateway.
function handler(event) {
  var request = event.request;
  request.headers['x-viewer-ip'] = { value: event.viewer.ip };
  return request;
}

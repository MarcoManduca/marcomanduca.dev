// /media/images/* behavior, viewer-request (cloudfront-js-2.0).
//
// Uploaded images live in the private media bucket under images/projects/
// and images/learning/, and are published on the site as /media/images/...
// (the /images/ path already belongs to the frontend bucket). An origin path
// can only add a prefix, so this function strips "/media" from the URI:
//   /media/images/projects/<uuid>-x.png -> /images/projects/<uuid>-x.png
// The bucket policy only lets CloudFront read images/*, so no URI (dot
// segments included) can reach the private cv/ prefix.
function handler(event) {
  var request = event.request;
  request.uri = request.uri.substring('/media'.length);
  return request;
}

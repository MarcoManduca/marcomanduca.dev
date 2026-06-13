# SES domain identity for sending contact-form emails as @<domain>.
#
# Verification is fully automated: Terraform writes the _amazonses TXT
# record and the three DKIM CNAMEs into Route 53 and waits for SES to
# confirm them. New accounts start in the SES sandbox — see infra/README.md
# step 6 for verifying the destination address / requesting production access.

resource "aws_ses_domain_identity" "this" {
  domain = var.domain_name
}

resource "aws_route53_record" "verification" {
  zone_id = var.zone_id
  name    = "_amazonses.${var.domain_name}"
  type    = "TXT"
  ttl     = 600
  records = [aws_ses_domain_identity.this.verification_token]
}

resource "aws_ses_domain_identity_verification" "this" {
  domain = aws_ses_domain_identity.this.id

  depends_on = [aws_route53_record.verification]
}

resource "aws_ses_domain_dkim" "this" {
  domain = aws_ses_domain_identity.this.domain
}

resource "aws_route53_record" "dkim" {
  count = 3

  zone_id = var.zone_id
  name    = "${aws_ses_domain_dkim.this.dkim_tokens[count.index]}._domainkey.${var.domain_name}"
  type    = "CNAME"
  ttl     = 600
  records = ["${aws_ses_domain_dkim.this.dkim_tokens[count.index]}.dkim.amazonses.com"]
}

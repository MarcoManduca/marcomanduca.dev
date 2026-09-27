# SES domain identity for sending contact-form emails as @<domain>.
#
# Verification is fully automated: Terraform writes the _amazonses TXT
# record and the three DKIM CNAMEs into Route 53 and waits for SES to
# confirm them. New accounts start in the SES sandbox — see infra/README.md
# step 6 for verifying the destination address / requesting production access.
#
# Sender authentication: DKIM signs as <domain>, and a custom MAIL FROM
# (mail.<domain>) makes SPF pass aligned with it too. The DMARC record then
# tells receivers to quarantine mail claiming to be from <domain> that passes
# neither, i.e. spoofing. SES is the only sender for the domain (Cognito
# uses its own default sender), so legitimate mail always aligns.

data "aws_region" "current" {}

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

# Envelope sender (bounces) on mail.<domain> instead of amazonses.com, so SPF
# is evaluated on — and aligns with — this domain.
resource "aws_ses_domain_mail_from" "this" {
  domain                 = aws_ses_domain_identity.this.domain
  mail_from_domain       = "mail.${var.domain_name}"
  behavior_on_mx_failure = "UseDefaultValue"
}

resource "aws_route53_record" "mail_from_mx" {
  zone_id = var.zone_id
  name    = aws_ses_domain_mail_from.this.mail_from_domain
  type    = "MX"
  ttl     = 600
  records = ["10 feedback-smtp.${data.aws_region.current.name}.amazonses.com"]
}

resource "aws_route53_record" "mail_from_spf" {
  zone_id = var.zone_id
  name    = aws_ses_domain_mail_from.this.mail_from_domain
  type    = "TXT"
  ttl     = 600
  records = ["v=spf1 include:amazonses.com -all"]
}

# Relaxed alignment (the default): mail.<domain> aligns with <domain> for SPF.
resource "aws_route53_record" "dmarc" {
  zone_id = var.zone_id
  name    = "_dmarc.${var.domain_name}"
  type    = "TXT"
  ttl     = 600
  records = [join("; ", compact([
    "v=DMARC1",
    "p=${var.dmarc_policy}",
    var.dmarc_report_email == null ? "" : "rua=mailto:${var.dmarc_report_email}",
  ]))]
}

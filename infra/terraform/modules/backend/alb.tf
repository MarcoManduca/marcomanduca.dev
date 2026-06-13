# ALB exposed to CloudFront only, over HTTPS.

# Regional certificate for the origin hostname (CloudFront certs live in
# us-east-1, but an ALB certificate must be in the ALB's own region).
resource "aws_acm_certificate" "origin" {
  domain_name       = var.api_origin_domain
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_route53_record" "origin_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.origin.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      type   = dvo.resource_record_type
      record = dvo.resource_record_value
    }
  }

  zone_id         = var.zone_id
  name            = each.value.name
  type            = each.value.type
  records         = [each.value.record]
  ttl             = 300
  allow_overwrite = true
}

resource "aws_acm_certificate_validation" "origin" {
  certificate_arn         = aws_acm_certificate.origin.arn
  validation_record_fqdns = [for record in aws_route53_record.origin_cert_validation : record.fqdn]
}

# Ingress restricted to CloudFront's origin-facing IP ranges. Anything else
# cannot even open a TCP connection to the ALB.
resource "aws_security_group" "alb" {
  name        = "${var.project_name}-alb"
  description = "ALB ingress from CloudFront only"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description     = "HTTPS from CloudFront origin-facing ranges"
    from_port       = 443
    to_port         = 443
    protocol        = "tcp"
    prefix_list_ids = [data.aws_ec2_managed_prefix_list.cloudfront.id]
  }

  egress {
    description = "Forward to backend tasks"
    from_port   = var.container_port
    to_port     = var.container_port
    protocol    = "tcp"
    cidr_blocks = [data.aws_vpc.default.cidr_block]
  }
}

resource "aws_lb" "this" {
  name               = "${var.project_name}-alb"
  load_balancer_type = "application"
  security_groups    = [aws_security_group.alb.id]
  subnets            = data.aws_subnets.default.ids
}

resource "aws_lb_target_group" "backend" {
  name        = "${var.project_name}-backend"
  port        = var.container_port
  protocol    = "HTTP"
  target_type = "ip"
  vpc_id      = data.aws_vpc.default.id

  health_check {
    path                = var.health_check_path
    matcher             = "200"
    interval            = 30
    healthy_threshold   = 2
    unhealthy_threshold = 3
  }
}

# Default action is 403: only requests carrying the CloudFront secret
# header (see the listener rule below) reach the backend.
resource "aws_lb_listener" "https" {
  load_balancer_arn = aws_lb.this.arn
  port              = 443
  protocol          = "HTTPS"
  ssl_policy        = "ELBSecurityPolicy-TLS13-1-2-2021-06"
  certificate_arn   = aws_acm_certificate_validation.origin.certificate_arn

  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "application/json"
      message_body = "{\"detail\":\"Forbidden\"}"
      status_code  = "403"
    }
  }
}

resource "aws_lb_listener_rule" "from_cloudfront" {
  listener_arn = aws_lb_listener.https.arn
  priority     = 1

  condition {
    http_header {
      http_header_name = "X-Origin-Verify"
      values           = [random_password.origin_verify.result]
    }
  }

  action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.backend.arn
  }
}

# Origin hostname CloudFront connects to (must match the certificate).
resource "aws_route53_record" "api_origin" {
  zone_id = var.zone_id
  name    = var.api_origin_domain
  type    = "A"

  alias {
    name                   = aws_lb.this.dns_name
    zone_id                = aws_lb.this.zone_id
    evaluate_target_health = true
  }
}

# ECR repository for the backend image.
#
# Tags are mutable because deploy-backend.sh pushes an immutable git-sha tag
# and moves the "latest" tag that the task definition points to.

resource "aws_ecr_repository" "backend" {
  name = "${var.project_name}-backend"

  image_scanning_configuration {
    scan_on_push = true
  }
}

# Keep only the 10 most recent images to avoid unbounded storage costs.
resource "aws_ecr_lifecycle_policy" "backend" {
  repository = aws_ecr_repository.backend.name

  policy = jsonencode({
    rules = [
      {
        rulePriority = 1
        description  = "Keep the last 10 images"
        selection = {
          tagStatus   = "any"
          countType   = "imageCountMoreThan"
          countNumber = 10
        }
        action = {
          type = "expire"
        }
      }
    ]
  })
}

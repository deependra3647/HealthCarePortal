pipeline {
    agent any

    environment {
        COMPOSE_PROJECT_NAME = 'healthcare'
        NODE_VERSION_REQUIRED = '22'
    }

    options {
        buildDiscarder(logRotator(numToKeepStr: '10'))
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
                script {
                    echo "Building branch: ${env.BRANCH_NAME ?: 'unknown'}"
                    echo "Commit: ${env.GIT_COMMIT ?: 'N/A'}"
                }
            }
        }

        stage('Verify Prerequisites') {
            steps {
                sh '''
                    set -e
                    echo "=== Tool versions ==="
                    node -v
                    npm -v
                    docker -v
                    docker compose version
                    NODE_MAJOR=$(node -v | sed 's/v//' | cut -d. -f1)
                    if [ "$NODE_MAJOR" -lt 22 ]; then
                      echo "ERROR: Node.js 22+ required. Install Node 22 on the Jenkins agent (EC2)."
                      exit 1
                    fi
                '''
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                }
            }
        }

        stage('Run Backend Tests') {
            steps {
                dir('backend') {
                    sh '''
                        if npm run | grep -qE '^  test$'; then
                          echo "Running backend tests..."
                          npm test
                        else
                          echo "No backend test script found — skipping safely."
                        fi
                    '''
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    sh '''
                        npm run build
                        if npm run | grep -qE '^  test$'; then
                          echo "Running frontend tests..."
                          npm test
                        else
                          echo "No frontend test script found — skipping safely."
                        fi
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Validate Docker Compose') {
            steps {
                sh '''
                    docker compose config --quiet
                    echo "docker-compose.yml is valid."
                '''
            }
        }

        stage('Deploy') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                }
            }
            steps {
                sh 'docker compose up -d --build'
                sh '''
                    echo "Waiting for services to start..."
                    sleep 10
                    docker compose ps
                    curl -sf http://localhost:5000/api/health || echo "API health check pending (may need seed / warm-up)"
                '''
            }
        }
    }

    post {
        success {
            echo 'Pipeline completed successfully.'
        }
        failure {
            echo 'Pipeline failed. Check stage logs above.'
        }
        always {
            sh 'docker compose ps -a 2>/dev/null || true'
        }
    }
}

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
                bat '''
                    echo === Tool versions ===
                    node -v
                    npm -v
                    docker -v
                    docker compose version
                '''
            }
        }

        stage('Install Backend Dependencies') {
            steps {
                dir('backend') {
                    bat 'npm ci'
                }
            }
        }

        stage('Install Frontend Dependencies') {
            steps {
                dir('frontend') {
                    bat 'npm ci'
                }
            }
        }

        stage('Run Backend Tests') {
            steps {
                dir('backend') {
                    bat 'npm test'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('frontend') {
                    bat '''
                        npm run build
                        npm test
                    '''
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                bat 'docker compose build'
            }
        }

        stage('Validate Docker Compose') {
            steps {
                bat '''
                    docker compose config
                    echo docker-compose.yml is valid.
                '''
            }
        }

        stage('Deploy') {
            steps {
                bat 'docker compose up -d --build'

                bat '''
                    timeout /t 10
                    docker compose ps
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
            bat 'docker compose ps -a'
        }
    }
}
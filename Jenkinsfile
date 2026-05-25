pipeline {
    agent any

    environment {
        NODE_VERSION = '20'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install & Test Backend') {
            steps {
                dir('backend') {
                    sh 'npm ci'
                    sh 'npm test'
                }
            }
        }

        stage('Install, Build & Test Frontend') {
            steps {
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                    sh 'npm test'
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh 'docker compose up -d'
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}

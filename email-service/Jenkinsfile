pipeline {
    agent any
    environment {
        APP_NAME = 'eventriest-server'
        RELEASE = '1.0.0'
        DOCKER_USER = 'username'
        DOCKER_PASS = 'password'
        IMAGE_NAME = "${DOCKER_USER}" + '/' + "${APP_NAME}"
        IMAGE_TAG = "${RELEASE}-${BUILD_NUMBER}"
    }
    stages {
        stage('Git Checkouts') {
            steps {
                git branch: 'email-service', credentialsId: '<git-credentials-id>', url: '<git-url>'
            }
        }
        stage('Build and push to docker hub') {
            steps {
                script {
                    docker.withRegistry('', DOCKER_PASS) {
                        docker_image = docker.build "${IMAGE_NAME}"
                    }
                    docker.withRegistry('', DOCKER_PASS) {
                        docker_image.push("${IMAGE_TAG}")
                        docker_image.push('latest')
                    }
                }
            }
        }
    }
}

FROM php:8.3-fpm

# system dependencies
RUN apt-get update && apt-get install -y \
    git unzip nano curl \
    libzip-dev libpng-dev libfreetype6-dev libjpeg62-turbo-dev libxml2-dev libonig-dev

# php extensions
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install pdo pdo_mysql mysqli zip gd mbstring xml bcmath

# composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configure PHP for large file uploads
RUN echo "upload_max_filesize = 500M" >> /usr/local/etc/php/php.ini && \
    echo "post_max_size = 500M" >> /usr/local/etc/php/php.ini

WORKDIR /var/www/app
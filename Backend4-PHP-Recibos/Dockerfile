FROM php:8.3-cli AS base

RUN apt-get update && apt-get install -y \
    git unzip libpq-dev libzip-dev libicu-dev \
    && docker-php-ext-install pdo_pgsql zip pcntl intl sockets \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html
COPY composer.json composer.lock* ./
RUN composer install --no-scripts --no-autoloader --no-interaction --prefer-dist

COPY . .
RUN mkdir -p bootstrap/cache storage/app/public storage/framework/cache/data storage/framework/sessions storage/framework/views storage/logs \
    && composer dump-autoload --optimize

EXPOSE 8001
# Migra y luego sirve (idempotente)
CMD ["sh", "-c", "php artisan migrate --force --seed 2>/dev/null || true; php artisan serve --host=0.0.0.0 --port=8001"]

"""Adaptador OUT — RabbitMQ (publica estimation.completed; consume order.created)."""
import json
import logging
import threading

import pika

from app.infrastructure.config.settings import settings

log = logging.getLogger("rabbitmq")


def _params() -> pika.URLParameters:
    return pika.URLParameters(settings.rabbitmq_url)


def publish(routing_key: str, payload: dict) -> None:
    try:
        conn = pika.BlockingConnection(_params())
        ch = conn.channel()
        ch.exchange_declare(exchange=settings.rabbitmq_exchange, exchange_type="topic", durable=True)
        ch.basic_publish(
            exchange=settings.rabbitmq_exchange,
            routing_key=routing_key,
            body=json.dumps(payload),
            properties=pika.BasicProperties(delivery_mode=2),
        )
        conn.close()
    except Exception as e:
        log.warning("No se pudo publicar %s: %s", routing_key, e)


def start_consumer(order_created_handler) -> None:
    """order.created → estimar costos IA en background (doc §5.5)."""

    def _consume():
        import time

        while True:
            try:
                conn = pika.BlockingConnection(_params())
                ch = conn.channel()
                ch.exchange_declare(exchange=settings.rabbitmq_exchange, exchange_type="topic", durable=True)
                q = ch.queue_declare(queue="ai.order_created", durable=True).method.queue
                ch.queue_bind(exchange=settings.rabbitmq_exchange, queue=q, routing_key="order.created")

                def cb(ch_, method, properties, body):
                    try:
                        order_created_handler(json.loads(body))
                    except Exception as e:
                        log.warning("handler order.created falló: %s", e)
                    ch_.basic_ack(delivery_tag=method.delivery_tag)

                ch.basic_consume(queue=q, on_message_callback=cb)
                log.info("Consumidor ai.order_created activo")
                ch.start_consuming()
            except Exception as e:
                log.warning("Consumidor RabbitMQ caído/no iniciado: %s — reintento en 10s", e)
            time.sleep(10)

    threading.Thread(target=_consume, daemon=True).start()

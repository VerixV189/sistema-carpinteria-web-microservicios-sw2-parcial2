package com.carpinteria.business.infrastructure.graphql.type;

import graphql.schema.Coercing;
import graphql.schema.GraphQLScalarType;
import java.time.Instant;
import java.time.LocalDate;

/** Scalars personalizados (referencia — DGS usa ExtendedScalars en GraphQLConfig). */
public final class CustomScalars {

    private CustomScalars() {}

    public static final GraphQLScalarType LOCAL_DATE = GraphQLScalarType.newScalar()
            .name("LocalDate")
            .description("Fecha ISO-8601 (yyyy-MM-dd)")
            .coercing(new Coercing<LocalDate, String>() {
                @Override
                public String serialize(Object dataFetcherResult) {
                    return dataFetcherResult.toString();
                }

                @Override
                public LocalDate parseValue(Object input) {
                    return LocalDate.parse(input.toString());
                }

                @Override
                public LocalDate parseLiteral(Object input) {
                    return LocalDate.parse(input.toString());
                }
            })
            .build();

    public static final GraphQLScalarType INSTANT = GraphQLScalarType.newScalar()
            .name("Instant")
            .description("Timestamp ISO-8601")
            .coercing(new Coercing<Instant, String>() {
                @Override
                public String serialize(Object dataFetcherResult) {
                    return dataFetcherResult.toString();
                }

                @Override
                public Instant parseValue(Object input) {
                    return Instant.parse(input.toString());
                }

                @Override
                public Instant parseLiteral(Object input) {
                    return Instant.parse(input.toString());
                }
            })
            .build();
}

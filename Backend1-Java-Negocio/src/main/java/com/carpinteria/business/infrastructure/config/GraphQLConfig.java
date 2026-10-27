package com.carpinteria.business.infrastructure.config;

import com.netflix.graphql.dgs.DgsComponent;
import com.netflix.graphql.dgs.DgsRuntimeWiring;
import graphql.scalars.ExtendedScalars;
import graphql.schema.idl.RuntimeWiring;

/** Scalars extra (Date/DateTime) disponibles para el schema. */
@DgsComponent
public class GraphQLConfig {

    @DgsRuntimeWiring
    public RuntimeWiring.Builder addScalars(RuntimeWiring.Builder builder) {
        return builder.scalar(ExtendedScalars.Date).scalar(ExtendedScalars.DateTime);
    }
}

package com.carpinteria.business.infrastructure.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * El gateway ya valida el JWT y propaga la identidad via headers
 * `x-user-*`. Este filtro solo refleja esa identidad en el SecurityContext.
 * Acceso directo sin gateway se permite en dev (ver ADR-004).
 */
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(auth -> auth.anyRequest().permitAll())
            .addFilterBefore(new GatewayIdentityFilter(), UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}

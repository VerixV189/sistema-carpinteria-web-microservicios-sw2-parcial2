package com.carpinteria.business.infrastructure.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Exige el secreto de malla `x-internal-secret` en toda petición (lo inyecta
 * el gateway tras validar el JWT, y lo envían n8n/ai-service entre sí).
 * Los `x-user-*` solo aportan contexto de usuario — sin el secreto, un header
 * falsificado directo al puerto no pasa (cierra el bypass + el spoofing).
 */
public class GatewayIdentityFilter extends OncePerRequestFilter {

    private static final String INTERNAL_SECRET =
            System.getenv().getOrDefault("INTERNAL_SECRET", "carpinteria-internal-dev");
    private static final List<String> PUBLIC_PATHS = List.of("/actuator/health");

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        if (PUBLIC_PATHS.stream().anyMatch(p -> request.getRequestURI().startsWith(p))) {
            chain.doFilter(request, response);
            return;
        }
        if (!INTERNAL_SECRET.equals(request.getHeader("x-internal-secret"))) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED,
                    "Secreto de malla requerido (tráfico vía gateway o servicio)");
            return;
        }
        String userId = request.getHeader("x-user-id");
        String role = request.getHeader("x-user-role");
        UsernamePasswordAuthenticationToken auth = (userId != null && role != null)
                ? new UsernamePasswordAuthenticationToken(
                        userId, null, List.of(new SimpleGrantedAuthority("ROLE_" + role)))
                : new UsernamePasswordAuthenticationToken(
                        "internal-service", null, List.of(new SimpleGrantedAuthority("ROLE_SYSTEM")));
        SecurityContextHolder.getContext().setAuthentication(auth);
        chain.doFilter(request, response);
    }
}

package com.app.pverse.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
@Slf4j
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-dir:./data/uploads}")
    private String uploadDir;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(
                        "http://localhost:3000",   // Next.js dev server
                        "http://localhost:5173",   // Vite (backup)
                        "http://127.0.0.1:3000"    // Alternative localhost
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }

    /**
     * Configure static resource handlers for serving uploaded files
     * CRITICAL: This enables serving images from /uploads/** URLs
     */
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Get absolute path to uploads directory
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        String uploadLocation = "file:" + uploadPath.toString() + "/";

        // Register resource handler for /uploads/**
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadLocation)
                .setCachePeriod(3600); // Cache for 1 hour

        log.info("========================================");
        log.info("📁 Static Resource Handler Configured:");
        log.info("   URL Pattern: /uploads/**");
        log.info("   File Location: {}", uploadLocation);
        log.info("   Absolute Path: {}", uploadPath);
        log.info("   Test URL: http://localhost:8080/uploads/moments/1/example.jpg");
        log.info("========================================");
    }
}
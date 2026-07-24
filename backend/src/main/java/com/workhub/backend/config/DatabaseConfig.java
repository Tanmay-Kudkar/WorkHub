package com.workhub.backend.config;

import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.jdbc.DataSourceProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;
import org.springframework.util.StringUtils;

import java.net.URI;

@Configuration
public class DatabaseConfig {

    private static final Logger log = LoggerFactory.getLogger(DatabaseConfig.class);

    @Bean
    @Primary
    @ConfigurationProperties("spring.datasource.hikari")
    public HikariDataSource dataSource(DataSourceProperties properties) {
        String rawUrl = properties.getUrl();
        String username = properties.getUsername();
        String password = properties.getPassword();

        if (StringUtils.hasText(rawUrl)) {
            ParsedDbUrl parsed = parseDatabaseUrl(rawUrl);
            String cleanUrl = parsed.jdbcUrl();

            if (StringUtils.hasText(parsed.username()) && (!StringUtils.hasText(username) || "postgres".equalsIgnoreCase(username.trim()))) {
                username = parsed.username();
            } else if (!StringUtils.hasText(username)) {
                username = "postgres";
            }

            if (StringUtils.hasText(parsed.password()) && !StringUtils.hasText(password)) {
                password = parsed.password();
            }

            properties.setUrl(cleanUrl);
            if (!StringUtils.hasText(properties.getDriverClassName())) {
                properties.setDriverClassName("org.postgresql.Driver");
            }
        }

        HikariDataSource dataSource = properties.initializeDataSourceBuilder()
                .type(HikariDataSource.class)
                .build();

        if (StringUtils.hasText(username)) {
            dataSource.setUsername(username);
        }
        if (StringUtils.hasText(password)) {
            dataSource.setPassword(password);
        }

        return dataSource;
    }

    public record ParsedDbUrl(String jdbcUrl, String username, String password) {}

    public static ParsedDbUrl parseDatabaseUrl(String rawUrl) {
        if (!StringUtils.hasText(rawUrl)) {
            return new ParsedDbUrl(rawUrl, null, null);
        }

        String input = rawUrl.trim();
        String extractedUser = null;
        String extractedPass = null;

        String uriString = input;
        if (uriString.startsWith("jdbc:")) {
            uriString = uriString.substring(5);
        }

        String dummySchemeUri = uriString;
        if (dummySchemeUri.startsWith("postgres://")) {
            dummySchemeUri = "http://" + dummySchemeUri.substring("postgres://".length());
        } else if (dummySchemeUri.startsWith("postgresql://")) {
            dummySchemeUri = "http://" + dummySchemeUri.substring("postgresql://".length());
        } else if (!dummySchemeUri.contains("://")) {
            dummySchemeUri = "http://" + dummySchemeUri;
        }

        try {
            URI uri = new URI(dummySchemeUri);
            if (uri.getUserInfo() != null) {
                String[] userInfo = uri.getUserInfo().split(":", 2);
                if (userInfo.length > 0) {
                    extractedUser = userInfo[0];
                }
                if (userInfo.length > 1) {
                    extractedPass = userInfo[1];
                }

                int atIndex = uriString.indexOf('@');
                int schemeIndex = uriString.indexOf("://");
                if (atIndex != -1 && schemeIndex != -1 && atIndex > schemeIndex) {
                    uriString = uriString.substring(0, schemeIndex + 3) + uriString.substring(atIndex + 1);
                } else if (atIndex != -1 && schemeIndex == -1) {
                    uriString = uriString.substring(atIndex + 1);
                }
            }
        } catch (Exception e) {
            log.debug("Failed to parse URI user info: {}", e.getMessage());
        }

        String jdbcUrl = uriString;
        if (jdbcUrl.startsWith("postgres://")) {
            jdbcUrl = "jdbc:postgresql://" + jdbcUrl.substring("postgres://".length());
        } else if (jdbcUrl.startsWith("postgresql://")) {
            jdbcUrl = "jdbc:postgresql://" + jdbcUrl.substring("postgresql://".length());
        } else if (!jdbcUrl.startsWith("jdbc:postgresql://") && jdbcUrl.startsWith("jdbc:")) {
            jdbcUrl = "jdbc:postgresql://" + jdbcUrl.substring(5);
        } else if (!jdbcUrl.startsWith("jdbc:postgresql://")) {
            jdbcUrl = "jdbc:postgresql://" + jdbcUrl;
        }

        return new ParsedDbUrl(jdbcUrl, extractedUser, extractedPass);
    }
}

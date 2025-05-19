package com.fishook.fishook;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FishookApplication {

    private static final Logger logger = LoggerFactory.getLogger(FishookApplication.class);

    @Value("${SERVER_PORT:8080}")
    private String serverPort;

    public static void main(String[] args) {
        SpringApplication.run(FishookApplication.class, args);
    }

    @PostConstruct
    public void init() {
        logger.info("SERVER_PORT from environment: {}", serverPort);
    }
}
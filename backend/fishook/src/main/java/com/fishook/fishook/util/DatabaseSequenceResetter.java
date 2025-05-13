package com.fishook.fishook.util;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.logging.Logger;

@Component
public class DatabaseSequenceResetter {

    private static final Logger logger = Logger.getLogger(DatabaseSequenceResetter.class.getName());

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @PostConstruct
    public void resetSequences() {
        logger.info("Starting database sequence reset process");

        List<String> tables = jdbcTemplate.queryForList(
                "SELECT table_name FROM information_schema.tables " +
                        "WHERE table_schema = 'public'", String.class);

        for (String table : tables) {
            try {
                Integer count = jdbcTemplate.queryForObject(
                        "SELECT COUNT(*) FROM information_schema.columns " +
                                "WHERE table_schema = 'public' AND table_name = ? AND column_name = 'id'",
                        Integer.class, table);

                if (count != null && count > 0) {
                    String sequenceName = jdbcTemplate.queryForObject(
                            "SELECT pg_get_serial_sequence('public." + table + "', 'id')",
                            String.class);

                    if (sequenceName != null) {
                        Integer maxId = jdbcTemplate.queryForObject(
                                "SELECT COALESCE(MAX(id), 0) FROM public." + table,
                                Integer.class);

                        jdbcTemplate.execute(
                                "SELECT setval('" + sequenceName + "', " + (maxId + 1) + ", false)");

                        logger.info("Reset sequence for table '" + table + "' to " + (maxId + 1));
                    }
                }
            } catch (Exception e) {
                logger.warning("Error resetting sequence for table " + table + ": " + e.getMessage());
            }
        }

        logger.info("Database sequence reset process completed");
    }
}
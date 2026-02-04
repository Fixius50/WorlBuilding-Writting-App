package com.worldbuilding.app.config;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;
import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;

@Converter(autoApply = true)
public class LocalDateTimeConverter implements AttributeConverter<LocalDateTime, String> {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;

    @Override
    public String convertToDatabaseColumn(LocalDateTime attribute) {
        if (attribute == null)
            return null;
        return attribute.format(FORMATTER);
    }

    @Override
    public LocalDateTime convertToEntityAttribute(String dbData) {
        if (dbData == null)
            return null;
        try {
            // Check if it's a numeric timestamp (milliseconds)
            if (dbData.matches("\\d+")) {
                long timestamp = Long.parseLong(dbData);
                return LocalDateTime.ofInstant(Instant.ofEpochMilli(timestamp), ZoneId.systemDefault());
            }
            return LocalDateTime.parse(dbData, FORMATTER);
        } catch (Exception e) {
            // Fallback for other formats if necessary
            return LocalDateTime.now();
        }
    }
}

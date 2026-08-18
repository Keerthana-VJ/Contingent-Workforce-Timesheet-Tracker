package com.contingentworkforce.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "validation.timesheet.rules")
@Getter
@Setter
public class ValidationConfigProperties {
    private int standardDailyHours = 8;
    private int standardWeeklyHours = 40;
    private int weekendReviewHours = 8;
    private int highDailyHours = 12;
    private int criticalDailyHours = 16;
    private int maxDailyHours = 24;
    private int weeklyReviewHours = 48;
    private int weeklyHighRiskHours = 60;
}
package com.contingentworkforce.service.validation;

import com.contingentworkforce.config.ValidationConfigProperties;
import com.contingentworkforce.dto.validation.ValidationResult;
import com.contingentworkforce.entity.Timesheet;
import com.contingentworkforce.repository.TimesheetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;


@Service
@RequiredArgsConstructor
public class TimesheetValidationEngine {

    private final ValidationConfigProperties config;
    private final TimesheetRepository timesheetRepository;

    public ValidationResult validate(Timesheet ts) {
        int riskScore = 0;
        boolean blocked = false;
        boolean reviewRequired = false;
        boolean warning = false;

        List<ValidationResult.TriggeredRule> triggeredRules = new ArrayList<>();

        double hours = ts.getTotalHours().doubleValue();

        // 1. Basic hour limits
        if (hours < 0) {
            blocked = true;
            addRule(triggeredRules, "NEGATIVE_HOURS", "BLOCKED", "Hours cannot be negative.");
        } else if (hours == 0) {
            warning = true;
            addRule(triggeredRules, "ZERO_HOURS", "WARNING", "Zero hours reported.");
        } else if (hours > config.getMaxDailyHours()) {
            blocked = true;
            addRule(triggeredRules, "EXCEEDS_MAX_HOURS", "BLOCKED",
                    "A single day cannot contain more than 24 working hours.");
        }

        // 2. Extremely high daily hours
        if (hours > config.getCriticalDailyHours() && hours <= config.getMaxDailyHours()) {
            reviewRequired = true;
            riskScore += 30;
            addRule(triggeredRules, "CRITICAL_DAILY_HOURS", "HIGH",
                    "Daily working hours exceed critical threshold (16h).");
        } else if (hours > config.getHighDailyHours() && hours <= config.getCriticalDailyHours()) {
            reviewRequired = true;
            riskScore += 20;
            addRule(triggeredRules, "HIGH_DAILY_HOURS", "REVIEW",
                    "Daily working hours exceed the normal working threshold (12h).");
        } else if (hours > config.getStandardDailyHours() && hours <= config.getHighDailyHours()) {
            warning = true;
            riskScore += 5;
            addRule(triggeredRules, "ELEVATED_DAILY_HOURS", "WARNING", "Daily working hours are above standard (8h).");
        }

        // 3. Weekend work
        DayOfWeek dow = ts.getWorkDate().getDayOfWeek();
        if (dow == DayOfWeek.SATURDAY || dow == DayOfWeek.SUNDAY) {
            riskScore += 10;
            if (hours > config.getHighDailyHours()) {
                reviewRequired = true;
                addRule(triggeredRules, "WEEKEND_EXTREME", "HIGH",
                        hours + " hours recorded on a weekend (exceeds 12h).");
            } else if (hours > config.getWeekendReviewHours()) {
                reviewRequired = true;
                addRule(triggeredRules, "WEEKEND_OVERTIME", "REVIEW", hours + " hours recorded on a weekend.");
            } else {
                warning = true;
                addRule(triggeredRules, "WEEKEND_WORK", "WARNING", "Weekend work detected.");
            }
        }

        // 4. Overlapping Project Hours
        UUID currentId = ts.getId();
        Double dailyTotal = timesheetRepository.sumTotalHoursByContractorIdAndWorkDateExcluding(ts.getContractor().getId(),
                ts.getWorkDate(), currentId);
        if (dailyTotal == null)
            dailyTotal = 0.0;

        if (dailyTotal + hours > config.getMaxDailyHours()) {
            blocked = true;
            addRule(triggeredRules, "OVERLAPPING_PROJECT_HOURS", "BLOCKED", "Contractor reported "
                    + (dailyTotal + hours) + " total hours across multiple projects on the same day.");
        } else if (dailyTotal + hours > config.getHighDailyHours()) {
            reviewRequired = true;
            riskScore += 15;
            addRule(triggeredRules, "HIGH_MULTIPLE_PROJECT_HOURS", "REVIEW",
                    "Total daily hours across projects is high (" + (dailyTotal + hours) + "h).");
        }

        // 5. Weekly Total Hours
        LocalDate startOfWeek = ts.getWorkDate().with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate endOfWeek = ts.getWorkDate().with(TemporalAdjusters.nextOrSame(DayOfWeek.SUNDAY));
        Double weeklyTotal = timesheetRepository
                .sumTotalHoursByContractorIdAndWorkDateBetweenExcluding(ts.getContractor().getId(), startOfWeek, endOfWeek, currentId);
        if (weeklyTotal == null)
            weeklyTotal = 0.0;

        double projectedWeekly = weeklyTotal + hours;

        if (projectedWeekly > config.getWeeklyHighRiskHours()) {
            reviewRequired = true;
            riskScore += 30;
            addRule(triggeredRules, "CRITICAL_WEEKLY_HOURS", "HIGH",
                    "Weekly total hours significantly exceed threshold (" + projectedWeekly + "h).");
        } else if (projectedWeekly > config.getWeeklyReviewHours()) {
            reviewRequired = true;
            riskScore += 20;
            addRule(triggeredRules, "HIGH_WEEKLY_HOURS", "REVIEW",
                    "Weekly total hours exceed normal review limits (" + projectedWeekly + "h).");
        } else if (projectedWeekly > config.getStandardWeeklyHours()) {
            warning = true;
            riskScore += 5;
            addRule(triggeredRules, "ELEVATED_WEEKLY_HOURS", "WARNING",
                    "Weekly total hours above standard (" + projectedWeekly + "h).");
        }

        // 6. Future dated validation (flags planned schedule as WARNING without blocking)
        if (ts.getWorkDate().isAfter(LocalDate.now())) {
            warning = true;
            riskScore += 5;
            addRule(triggeredRules, "PLANNED_SCHEDULE", "WARNING", "Timesheet submitted for planned schedule date in project cycle (" + ts.getWorkDate() + ").");
        }



        String status = "PASS";
        if (blocked)
            status = "BLOCKED";
        else if (reviewRequired)
            status = "REVIEW_REQUIRED";
        else if (warning)
            status = "WARNING";

        String riskLevel = "LOW";
        if (riskScore >= 70)
            riskLevel = "CRITICAL";
        else if (riskScore >= 40)
            riskLevel = "HIGH";
        else if (riskScore >= 20)
            riskLevel = "MEDIUM";

        return ValidationResult.builder()
                .status(status)
                .riskScore(riskScore)
                .riskLevel(riskLevel)
                .rulesTriggered(triggeredRules)
                .build();
    }

    private void addRule(List<ValidationResult.TriggeredRule> list, String rule, String severity, String message) {
        list.add(ValidationResult.TriggeredRule.builder()
                .rule(rule)
                .severity(severity)
                .message(message)
                .build());
    }
}